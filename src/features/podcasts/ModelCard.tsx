/**
 * Stemkwaliteit vergelijken (keuze 1f): het eerste fragment van een aflevering in de drie
 * stemmodellen, met een kostenindicatie in euro's (keuze 10a), en dan kiezen.
 */
import { Check, Sparkles, Wand2 } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { Pill } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { toast } from '@/components/toastStore';
import { PODCAST, TTS_MODELS, ttsModelInfo } from '@/config/podcast';
import { tp } from '@/i18n/podcast';
import { charsForMinutes, formatEur, ttsEur } from '@/podcast/costs';
import { useCurrentEpisode } from '@/podcast/hooks';
import { speakableText } from '@/podcast/speech';
import { comparisonSample } from '@/podcast/voiceChoice';
import { usePodcastStore } from '@/store/podcastStore';
import { speakerLabel } from './format';

export function ModelCard() {
  const titleId = useId();
  const selectId = useId();
  const allEpisodes = usePodcastStore((s) => s.episodes);
  const chosen = usePodcastStore((s) => s.settings.ttsModel) ?? PODCAST.defaultTtsModel;
  const current = useCurrentEpisode();
  const episodes = allEpisodes.filter((e) => e.status === 'klaar' && e.segments.length > 0);
  const [episodeId, setEpisodeId] = useState(current?.id ?? episodes[0]?.id);
  const [samples, setSamples] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const urlsRef = useRef<string[]>([]);
  const episode = episodes.find((e) => e.id === episodeId) ?? episodes[0];
  const fragment = episode?.segments[0];
  const perTen = (model: string) => formatEur(ttsEur(charsForMinutes(10), model));

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  const make = async (model: string) => {
    if (!episode) return;
    setBusy(model);
    try {
      const blob = await comparisonSample(episode.id, model);
      const url = URL.createObjectURL(blob);
      urlsRef.current.push(url);
      setSamples((all) => ({ ...all, [model]: url }));
    } catch {
      toast(tp.voices.failed, 'warn');
    } finally {
      setBusy(null);
    }
  };

  const choose = (model: string) => {
    usePodcastStore.getState().updateSettings({ ttsModel: model });
    toast(tp.model.saved(ttsModelInfo(model).label), 'ok');
  };

  return (
    <Card as="section" aria-labelledby={titleId}>
      <h2 id={titleId} className="flex items-center gap-2 text-xl">
        <Sparkles aria-hidden className="size-5 text-gold" />
        {tp.model.title}
      </h2>
      <p className="mt-1 text-sm text-ink-2">{tp.model.intro}</p>
      <p className="mt-2 font-medium">
        {tp.model.current(ttsModelInfo(chosen).label, perTen(chosen))}
      </p>

      {!episode || !fragment ? (
        <p className="mt-2 text-sm text-ink-3">{tp.model.noEpisode}</p>
      ) : (
        <>
          <label htmlFor={selectId} className="mt-3 block text-sm font-medium">
            {tp.model.episode}
          </label>
          <select
            id={selectId}
            value={episode.id}
            onChange={(event) => {
              setEpisodeId(event.target.value);
              setSamples({});
            }}
            className="mt-1 min-h-9 w-full rounded-xl border border-line-strong bg-card px-3 text-sm"
          >
            {episodes.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
          <p className="mt-1 text-sm text-ink-3">
            {tp.model.fragment(speakerLabel(fragment.speaker))}
          </p>
          <ul className="mt-3 space-y-3">
            {TTS_MODELS.map((model) => {
              const chars = speakableText(fragment.text, model.id).length;
              const isChosen = model.id === chosen;
              return (
                <li key={model.id} className="rounded-xl border border-line bg-paper p-3">
                  <p className="flex flex-wrap items-center gap-2 font-medium">
                    {model.label}
                    {isChosen && (
                      <Pill tone="ok" icon={<Check aria-hidden className="size-3" />}>
                        {tp.model.chosen}
                      </Pill>
                    )}
                  </p>
                  <p className="text-sm text-ink-2">
                    {model.description}
                    {model.audioTags && ` ${tp.model.tags}`}
                  </p>
                  <p className="mt-0.5 text-sm text-ink-3">
                    {tp.model.costLine(formatEur(ttsEur(chars, model.id)), perTen(model.id))}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {samples[model.id] ? (
                      <audio
                        controls
                        src={samples[model.id]}
                        aria-label={tp.model.player(model.label)}
                        className="w-full"
                      />
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busy !== null}
                        aria-label={tp.model.makeFor(model.label)}
                        icon={<Wand2 aria-hidden className="size-4" />}
                        onClick={() => void make(model.id)}
                      >
                        {busy === model.id ? tp.model.making : tp.model.make}
                      </Button>
                    )}
                    {!isChosen && (
                      <Button
                        size="sm"
                        aria-label={tp.model.chooseFor(model.label)}
                        onClick={() => choose(model.id)}
                      >
                        {tp.model.choose}
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Card>
  );
}
