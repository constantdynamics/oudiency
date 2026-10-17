/**
 * Inbellen tijdens een aflevering: de aflevering pauzeert, je praat live met de denker (of met
 * Sophie bij een gesprek tussen twee denkers) en daarna luister je verder.
 */
import { Play } from 'lucide-react';
import { useCallback, useState, useSyncExternalStore } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Button, ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { CrisisCard } from '@/components/CrisisCard';
import { EmptyState } from '@/components/EmptyState';
import { ThemeFrame } from '@/components/ThemeFrame';
import { PODCAST } from '@/config/podcast';
import { findMeta, useFigure } from '@/data/figures';
import { HOST_ID, HOST_NAME, HOST_PARTNER } from '@/data/podcastHost';
import { CallLobby, CallTranscript, LiveCall } from '@/features/voice/callParts';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tp } from '@/i18n/podcast';
import { tv } from '@/i18n/voice';
import { calleeOf } from '@/podcast/episodeInfo';
import { submitQuestion } from '@/podcast/listenerQuestion';
import { createPodcastCall } from '@/podcast/podcastCall';
import { pausePodcast, withPlayer } from '@/podcast/playerActions';
import { usePodcastStore } from '@/store/podcastStore';
import type { CallSession, CallState } from '@/voice/callSession';
import { BackToPodcasts } from './playerParts';
import { usePodcastKeys } from './usePodcastKeys';

const IDLE: CallState = {
  status: 'klaar',
  mode: 'luistert',
  muted: false,
  transcript: [],
  crisis: false,
};
const noop = () => () => undefined;

/** Het gesprek met Sophie als luistervraag: alleen wat er echt gezegd is, zonder systeemregels. */
function callLines(state: CallState) {
  return state.transcript
    .filter((line) => line.role !== 'system')
    .map((line) => ({
      role: line.role === 'user' ? ('user' as const) : ('host' as const),
      text: line.text,
    }));
}

export function PodcastCallPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const episode = usePodcastStore((s) => s.episodes.find((e) => e.id === id));
  const calleeId = episode ? calleeOf(episode) : undefined;
  const host = calleeId === HOST_ID;
  const { figure } = useFigure(host ? undefined : calleeId);
  const keys = usePodcastKeys();
  const [call, setCall] = useState<CallSession | null>(null);
  const [passedOn, setPassedOn] = useState(false);
  const subscribe = useCallback(
    (listener: () => void) => (call ? call.subscribe(listener) : noop()),
    [call],
  );
  const getSnapshot = useCallback(() => (call ? call.getSnapshot() : IDLE), [call]);
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const partner = host ? HOST_PARTNER : findMeta(calleeId);
  useDocumentTitle(
    partner ? tp.question.callFigure(partner.shortName ?? partner.name) : tp.call.eyebrow,
  );

  if (!episode || !partner) {
    return (
      <div className="mx-auto max-w-xl">
        <BackToPodcasts />
        <EmptyState title={tp.call.notFound} />
      </div>
    );
  }
  const name = partner.shortName ?? partner.name;
  const back = `/podcasts/${episode.id}`;

  // Vanuit de tik zelf (nooit vanuit een effect): zo geeft iOS de microfoon en audio vrij.
  const start = () => {
    pausePodcast();
    const next = createPodcastCall(episode.id, (ended) => {
      // Bij Sophie wordt het gesprek een luistervraag (keuze 7e); nooit bij een crisissignaal.
      const lines = callLines(ended);
      if (!host || ended.crisis || !lines.some((line) => line.role === 'user')) return;
      setPassedOn(true);
      void submitQuestion(episode.id, { call: lines });
    });
    if (!next) return;
    setCall(next);
    void next.start();
  };

  const resume = () => {
    withPlayer((p) => p.play(episode.id));
    navigate(back);
  };

  let content;
  if (!keys.elevenLabs || (host && !keys.claude)) {
    content = (
      <Card className="mx-auto max-w-xl">
        <p>{tp.call.needsKeys}</p>
        <ButtonLink className="mt-3" variant="secondary" size="sm" to="/podcasts">
          {tp.setup.title}
        </ButtonLink>
      </Card>
    );
  } else if (state.status === 'klaar' || state.status === 'fout') {
    content = (
      <CallLobby
        meta={partner}
        error={state.error}
        onStart={start}
        eyebrow={tp.call.eyebrow}
        subtitle={tp.call.subtitle(PODCAST.callMinutes)}
        note={host ? tp.call.hostNote : tp.call.note(partner.name)}
        backTo={back}
        backLabel={tp.call.back}
      />
    );
  } else if (state.status === 'beeindigd') {
    content = (
      <div className="mx-auto max-w-xl space-y-6">
        {state.crisis && <CrisisCard />}
        <Card as="section" aria-labelledby="opgehangen">
          <h1 id="opgehangen" className="text-3xl">
            {tp.call.ended}
          </h1>
          <p className="mt-2 text-ink-2">{tv.endReasons[state.endReason ?? 'gebruiker']}</p>
          {host && !state.crisis && (
            <p className="mt-2" role="status">
              {passedOn ? tp.call.passedOn : tp.call.nothingToPass}
            </p>
          )}
          {!state.crisis && (
            <Button
              className="mt-4"
              icon={<Play aria-hidden className="size-4" />}
              onClick={resume}
            >
              {tp.call.resume}
            </Button>
          )}
        </Card>
        <CallTranscript lines={state.transcript} name={name} />
      </div>
    );
  } else {
    content = (
      <LiveCall
        meta={partner}
        thinking={figure?.microcopy.thinking ?? tp.call.thinking(host ? HOST_NAME : name)}
        state={state}
        eyebrow={tp.call.eyebrow}
        onToggleMute={() => call?.toggleMute()}
        onHangUp={() => void call?.hangUp('gebruiker')}
      />
    );
  }

  return (
    <ThemeFrame figure={partner} className="pb-6">
      {content}
    </ThemeFrame>
  );
}
