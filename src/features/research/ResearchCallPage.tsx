/**
 * Bellen over een onderzoek: tien minuten met één denker uit het panel, met de onderzoeksnotitie
 * als achtergrond. Ook voor denkers zonder eigen ontworpen stem (dan een kant-en-klare stem).
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from 'react';
import { useParams } from 'react-router';
import { ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { ThemeFrame } from '@/components/ThemeFrame';
import { RESEARCH } from '@/config/research';
import { findMeta, useFigure } from '@/data/figures';
import { usePodcastKeys } from '@/features/podcasts/usePodcastKeys';
import { CallEnded, CallLobby, LiveCall } from '@/features/voice/callParts';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tr } from '@/i18n/research';
import { tv } from '@/i18n/voice';
import { pausePodcast } from '@/podcast/playerActions';
import { createResearchCall } from '@/research/researchCall';
import { useResearchStore } from '@/store/researchStore';
import { useVoiceStore } from '@/store/voiceStore';
import type { CallSession, CallState } from '@/voice/callSession';
import { BackToResearch } from './researchParts';

const IDLE: CallState = {
  status: 'klaar',
  mode: 'luistert',
  muted: false,
  transcript: [],
  crisis: false,
};
const noop = () => () => undefined;

export function ResearchCallPage() {
  const { id, figureId } = useParams();
  const research = useResearchStore((s) => s.researches.find((r) => r.id === id));
  const meta = research?.figureIds.includes(figureId ?? '') ? findMeta(figureId) : undefined;
  const { figure } = useFigure(meta?.id);
  const keys = usePodcastKeys();
  const [call, setCall] = useState<CallSession | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [costPending, setCostPending] = useState(false);
  const trial = useVoiceStore((s) => s.trials.find((t) => t.id === callId));
  const subscribe = useCallback(
    (listener: () => void) => (call ? call.subscribe(listener) : noop()),
    [call],
  );
  const getSnapshot = useCallback(() => (call ? call.getSnapshot() : IDLE), [call]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const active =
    state.status === 'verbinden' || state.status === 'live' || state.status === 'afscheid';
  useDocumentTitle(meta ? tv.call.start(meta.shortName ?? meta.name) : tr.call.eyebrow);

  // Pagina verlaten = ophangen (het gesprek wordt dan nog wel bewaard).
  useEffect(() => () => call?.dispose(), [call]);

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

  if (!research || !meta) {
    return (
      <div className="mx-auto max-w-xl">
        <BackToResearch />
        <EmptyState title={tr.call.notFound} />
      </div>
    );
  }
  const back = `/onderzoek/${research.id}`;

  // Vanuit de tik zelf (nooit vanuit een effect): zo geeft iOS de microfoon en audio vrij.
  const start = () => {
    const next = createResearchCall(research.id, meta.id, {
      onSaved: (savedId) => {
        setCallId(savedId);
        setCostPending(true);
      },
      onCostDone: () => setCostPending(false),
    });
    if (!next) return;
    setCallId(null);
    setCall(next);
    pausePodcast();
    void next.start();
  };

  let content;
  if (research.status !== 'klaar') {
    content = (
      <Card className="mx-auto max-w-xl">
        <p>{tr.call.notReady}</p>
        <ButtonLink className="mt-3" variant="secondary" size="sm" to={back}>
          {tr.call.back}
        </ButtonLink>
      </Card>
    );
  } else if (!keys.elevenLabs && !call) {
    content = (
      <Card className="mx-auto max-w-xl">
        <p>{tr.call.needsKey}</p>
        <ButtonLink className="mt-3" variant="secondary" size="sm" to="/profiel/stem">
          {tr.call.toSettings}
        </ButtonLink>
      </Card>
    );
  } else if (state.status === 'klaar' || state.status === 'fout') {
    content = (
      <CallLobby
        meta={meta}
        error={state.error}
        onStart={start}
        eyebrow={tr.call.eyebrow}
        subtitle={tr.call.subtitle(RESEARCH.callMinutes)}
        note={tr.call.note(meta.name)}
        backTo={back}
        backLabel={tr.call.back}
      />
    );
  } else if (state.status === 'beeindigd') {
    content = (
      <CallEnded
        meta={meta}
        state={state}
        trial={trial}
        costPending={costPending}
        onAgain={start}
      />
    );
  } else {
    content = (
      <LiveCall
        meta={meta}
        thinking={figure?.microcopy.thinking ?? tr.call.thinking(meta.shortName ?? meta.name)}
        state={state}
        eyebrow={tr.call.eyebrow}
        onToggleMute={() => call?.toggleMute()}
        onHangUp={() => void call?.hangUp('gebruiker')}
      />
    );
  }

  return (
    <ThemeFrame figure={meta} className="pb-6">
      {content}
    </ThemeFrame>
  );
}
