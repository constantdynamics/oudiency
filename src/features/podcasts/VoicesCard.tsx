/**
 * Stemmen (keuzes 2d en 8b): per spreker de stem die hij nu heeft, een voorbeeld, "Andere stem" en
 * terug naar automatisch. Los geladen: alleen nodig met een ElevenLabs-sleutel.
 */
import { RefreshCw, Undo2, Volume2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { toast } from '@/components/toastStore';
import { findMeta } from '@/data/figures';
import { HOST_ID, HOST_PARTNER } from '@/data/podcastHost';
import { tp } from '@/i18n/podcast';
import {
  chooseAnotherVoice,
  currentVoiceOf,
  libraryForKey,
  resetVoice,
  voiceSample,
} from '@/podcast/voiceChoice';
import type { LibraryVoice } from '@/podcast/voices';
import { usePodcastStore } from '@/store/podcastStore';
import { useVoiceStore } from '@/store/voiceStore';
import { speakerLabel } from './format';

/** Sophie en alle denkers die in je afleveringen voorkomen. */
function useSpeakers(): string[] {
  const episodes = usePodcastStore((s) => s.episodes);
  const ids = new Set<string>([HOST_ID]);
  for (const episode of episodes) for (const id of episode.figureIds) ids.add(id);
  return [...ids];
}

function VoiceLabel({ speaker, library }: { speaker: string; library: LibraryVoice[] | null }) {
  // Opnieuw tekenen als een keuze verandert.
  useVoiceStore((s) => s.overrides?.[speaker]?.voiceId ?? s.voices[speaker]?.voiceId);
  if (!library) return <span className="text-ink-3">{tp.voices.loading}</span>;
  const voice = currentVoiceOf(speaker, library);
  const kind =
    voice?.source === 'gekozen'
      ? tp.voices.chosen
      : voice?.source === 'eigen'
        ? tp.voices.designed
        : tp.voices.automatic;
  return (
    <span className="text-ink-3">
      {kind}
      {voice?.name ? ` · ${voice.name}` : voice ? '' : ` · ${tp.voices.unknown}`}
    </span>
  );
}

function SpeakerRow({ speaker, library }: { speaker: string; library: LibraryVoice[] | null }) {
  const chosen = useVoiceStore((s) => Boolean(s.overrides?.[speaker]));
  const [busy, setBusy] = useState(false);
  const name = speakerLabel(speaker);
  const meta = speaker === HOST_ID ? HOST_PARTNER : findMeta(speaker);

  const listen = async () => {
    setBusy(true);
    try {
      const blob = await voiceSample(speaker);
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.addEventListener('ended', () => URL.revokeObjectURL(url));
      await audio.play();
    } catch {
      toast(tp.voices.failed, 'warn');
    } finally {
      setBusy(false);
    }
  };

  const another = async () => {
    setBusy(true);
    try {
      const voice = await chooseAnotherVoice(speaker);
      if (voice) toast(tp.voices.changed(name, voice.name ?? ''), 'ok');
    } catch {
      toast(tp.voices.failed, 'warn');
    } finally {
      setBusy(false);
    }
  };

  return (
    <li className="flex flex-wrap items-center gap-x-3 gap-y-2 py-2">
      {meta && <Avatar figure={meta} size={36} />}
      <span className="min-w-0 flex-1">
        <span className="block font-medium">{name}</span>
        <span className="block text-sm">
          <VoiceLabel speaker={speaker} library={library} />
        </span>
      </span>
      <span className="flex flex-wrap gap-1">
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          aria-label={tp.voices.listen(name)}
          title={tp.voices.listen(name)}
          icon={<Volume2 aria-hidden className="size-4" />}
          onClick={() => void listen()}
        />
        <Button
          size="sm"
          variant="secondary"
          disabled={busy}
          aria-label={tp.voices.anotherFor(name)}
          icon={<RefreshCw aria-hidden className="size-4" />}
          onClick={() => void another()}
        >
          {tp.voices.another}
        </Button>
        {chosen && (
          <Button
            size="sm"
            variant="ghost"
            aria-label={tp.voices.resetFor(name)}
            icon={<Undo2 aria-hidden className="size-4" />}
            onClick={() => {
              resetVoice(speaker);
              toast(tp.voices.resetDone(name), 'ok');
            }}
          >
            {tp.voices.reset}
          </Button>
        )}
      </span>
    </li>
  );
}

export function VoicesCard() {
  const titleId = useId();
  const speakers = useSpeakers();
  const [library, setLibrary] = useState<LibraryVoice[] | null>(null);

  useEffect(() => {
    let active = true;
    libraryForKey().then(
      (voices) => {
        if (active) setLibrary(voices);
      },
      () => {
        if (active) setLibrary([]);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  return (
    <Card as="section" aria-labelledby={titleId}>
      <h2 id={titleId} className="text-xl">
        {tp.voices.title}
      </h2>
      <p className="mt-1 text-sm text-ink-2">{tp.voices.intro}</p>
      <ul className="mt-2 divide-y divide-line">
        {speakers.map((speaker) => (
          <SpeakerRow key={speaker} speaker={speaker} library={library} />
        ))}
      </ul>
      <p className="mt-2 text-sm text-ink-3">{tp.voices.note}</p>
    </Card>
  );
}
