import { PhoneOff } from 'lucide-react';
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useParams } from 'react-router';
import { asrKeywords, buildCallPrompt, buildFirstMessage } from '@/ai/prompts/voice';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ThemeFrame } from '@/components/ThemeFrame';
import { Thinking } from '@/components/Thinking';
import { VOICE } from '@/config/voice';
import { findMeta, useFigure } from '@/data/figures';
import type { Figure } from '@/data/types';
import { voiceSpecFor, type VoiceSpec } from '@/data/voices';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tv } from '@/i18n/voice';
import { MINUTE } from '@/lib/dates';
import { uid } from '@/lib/ids';
import { useProfileStore } from '@/store/profileStore';
import { elevenLabsKeyStorage, useHasSecret } from '@/store/settingsStore';
import { useVoiceStore } from '@/store/voiceStore';
import { createElevenLabsApi, VoiceApiError } from '@/voice/api';
import { CallSession, type CallState } from '@/voice/callSession';
import { elevenLabsStarter } from '@/voice/elevenlabsCall';
import { callVoice, ensureAgent, hasCallVoice, lookUpCallCost } from '@/voice/setup';
import { pausePodcast } from '@/podcast/playerActions';
import { CallEnded, CallLobby, LiveCall } from './callParts';

const IDLE: CallState = {
  status: 'klaar',
  mode: 'luistert',
  muted: false,
  transcript: [],
  crisis: false,
};
const noop = () => () => undefined;

function iso(ms: number | undefined): string {
  return new Date(ms ?? 0).toISOString();
}

/** Maakt een nieuwe sessie voor één belpoging (bij opnieuw bellen komt er een nieuwe). */
function createSession(
  figure: Figure,
  spec: VoiceSpec,
  callbacks: { onSaved: (trialId: string) => void; onCostDone: () => void },
): CallSession | null {
  const key = elevenLabsKeyStorage.get();
  if (!key) return null;
  const api = createElevenLabsApi(key);
  let creditsBefore: number | undefined;

  return new CallSession({
    durationMs: VOICE.trialMinutes * MINUTE,
    start: elevenLabsStarter(async () => {
      const [agentId, before] = await Promise.all([
        ensureAgent(api),
        api.subscription().then(
          (info) => info.creditsUsed,
          () => undefined,
        ),
      ]);
      creditsBefore = before;
      const voiceId = await callVoice(api, figure.id);
      if (!voiceId) {
        throw new VoiceApiError(
          'not_found',
          'De gekozen stem staat niet meer in je ElevenLabs-account.',
        );
      }
      return {
        signedUrl: await api.signedUrl(agentId),
        prompt: buildCallPrompt({
          figure,
          minutes: VOICE.trialMinutes,
          studentName: useProfileStore.getState().profile.displayName,
        }),
        firstMessage: buildFirstMessage(figure, spec),
        voiceId,
        speed: spec.speed,
        stability: spec.stability,
        keywords: asrKeywords(figure),
      };
    }),
    onEnded: (state) => {
      const id = uid('proef');
      useVoiceStore.getState().addTrial({
        id,
        figureId: figure.id,
        startedAt: iso(state.startedAt),
        endedAt: iso(state.endedAt),
        endReason: state.endReason ?? 'gebruiker',
        conversationId: state.conversationId,
        transcript: state.transcript.map((line) => ({
          role: line.role,
          text: line.text,
          at: iso(line.at),
        })),
      });
      callbacks.onSaved(id);
      void lookUpCallCost(api, state.conversationId, creditsBefore)
        .then((cost) => {
          if (cost) useVoiceStore.getState().setTrialCost(id, cost);
        })
        .finally(callbacks.onCostDone);
    },
  });
}

export function CallPage() {
  const { figureId } = useParams();
  const meta = findMeta(figureId);
  const spec = meta ? voiceSpecFor(meta.id) : undefined;
  const { figure } = useFigure(spec ? meta?.id : undefined);
  const hasKey = useHasSecret(elevenLabsKeyStorage);
  const hasVoice = useVoiceStore((s) => (meta ? hasCallVoice(s, meta.id) : false));
  const [session, setSession] = useState<CallSession | null>(null);
  const [trialId, setTrialId] = useState<string | null>(null);
  const [costPending, setCostPending] = useState(false);
  const trial = useVoiceStore((s) => s.trials.find((t) => t.id === trialId));
  useDocumentTitle(meta ? tv.call.start(meta.shortName ?? meta.name) : tv.call.unavailableTitle);

  const subscribe = useCallback(
    (listener: () => void) => (session ? session.subscribe(listener) : noop()),
    [session],
  );
  const getSnapshot = useCallback(() => (session ? session.getSnapshot() : IDLE), [session]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const active =
    state.status === 'verbinden' || state.status === 'live' || state.status === 'afscheid';

  // Pagina verlaten = ophangen (het gesprek wordt dan nog wel bewaard).
  useEffect(() => () => session?.dispose(), [session]);

  // Waarschuwen bij sluiten of herladen tijdens een gesprek.
  useEffect(() => {
    if (!active) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = tv.call.leaveWarning;
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [active]);

  if (!meta || !spec) {
    return (
      <EmptyState
        className="mt-6"
        icon={<PhoneOff aria-hidden className="size-8" />}
        title={tv.call.unavailableTitle}
        action={<ButtonLink to="/profiel/stem">{tv.call.toSettings}</ButtonLink>}
      >
        {tv.call.unavailableBody}
      </EmptyState>
    );
  }

  if ((!hasKey || !hasVoice) && !session) {
    return (
      <EmptyState
        className="mt-6"
        icon={<PhoneOff aria-hidden className="size-8" />}
        title={tv.call.notReadyTitle}
        action={<ButtonLink to="/profiel/stem">{tv.call.toSettings}</ButtonLink>}
      >
        {tv.call.notReadyBody}
      </EmptyState>
    );
  }

  if (!figure) {
    return (
      <ThemeFrame figure={meta}>
        <Thinking
          className="mt-10 justify-center"
          text={tv.call.connecting(meta.shortName ?? meta.name)}
        />
      </ThemeFrame>
    );
  }

  const startCall = () => {
    const next = createSession(figure, spec, {
      onSaved: (id) => {
        setTrialId(id);
        setCostPending(true);
      },
      onCostDone: () => setCostPending(false),
    });
    if (!next) return;
    setTrialId(null);
    setSession(next);
    pausePodcast();
    void next.start();
  };

  return (
    <ThemeFrame figure={meta} className="pb-6">
      {state.status === 'klaar' || state.status === 'fout' ? (
        <CallLobby meta={meta} error={state.error} onStart={startCall} />
      ) : state.status === 'beeindigd' ? (
        <CallEnded
          meta={meta}
          state={state}
          trial={trial}
          costPending={costPending}
          onAgain={startCall}
        />
      ) : (
        <LiveCall
          meta={meta}
          thinking={figure.microcopy.thinking}
          state={state}
          onToggleMute={() => session?.toggleMute()}
          onHangUp={() => void session?.hangUp('gebruiker')}
        />
      )}
    </ThemeFrame>
  );
}
