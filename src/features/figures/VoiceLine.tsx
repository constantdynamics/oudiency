/**
 * Op het profiel van een denker: welke stem hij heeft, en "Andere stem" (keuze 8c). Los geladen:
 * alleen met een ElevenLabs-sleutel.
 */
import { useEffect, useState } from 'react';
import { toast } from '@/components/toastStore';
import { tp } from '@/i18n/podcast';
import {
  chooseAnotherVoice,
  currentVoiceOf,
  libraryForKey,
  resetVoice,
} from '@/podcast/voiceChoice';
import type { LibraryVoice } from '@/podcast/voices';
import { useVoiceStore } from '@/store/voiceStore';

export function VoiceLine({ figureId, name }: { figureId: string; name: string }) {
  const [library, setLibrary] = useState<LibraryVoice[] | null>(null);
  const [busy, setBusy] = useState(false);
  const chosen = useVoiceStore((s) => Boolean(s.overrides?.[figureId]));
  // Opnieuw tekenen als de stem verandert.
  useVoiceStore((s) => s.overrides?.[figureId]?.voiceId ?? s.voices[figureId]?.voiceId);

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

  const voice = library ? currentVoiceOf(figureId, library) : undefined;
  const kind =
    voice?.source === 'gekozen'
      ? tp.voices.chosen
      : voice?.source === 'eigen'
        ? tp.voices.designed
        : tp.voices.automatic;

  const another = async () => {
    setBusy(true);
    try {
      const next = await chooseAnotherVoice(figureId);
      if (next) toast(tp.voices.changed(name, next.name ?? ''), 'ok');
    } catch {
      toast(tp.voices.failed, 'warn');
    } finally {
      setBusy(false);
    }
  };

  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-2">
      <span>
        {tp.voices.profileLabel}:{' '}
        {library ? (
          <>
            {kind}
            {voice?.name && ` · ${voice.name}`}
          </>
        ) : (
          tp.voices.loading
        )}
      </span>
      <button
        type="button"
        disabled={busy}
        onClick={() => void another()}
        className="font-medium text-fig underline underline-offset-2 disabled:opacity-50"
      >
        {tp.voices.anotherFor(name)}
      </button>
      {chosen && (
        <button
          type="button"
          onClick={() => {
            resetVoice(figureId);
            toast(tp.voices.resetDone(name), 'ok');
          }}
          className="font-medium text-ink-2 underline underline-offset-2"
        >
          {tp.voices.reset}
        </button>
      )}
    </p>
  );
}
