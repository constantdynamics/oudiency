import { Lightbulb, PenLine } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/Chips';
import { CrisisCard } from '@/components/CrisisCard';
import { TextField } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { toast } from '@/components/toastStore';
import { PODCAST, ttsModelInfo } from '@/config/podcast';
import { findMeta } from '@/data/figures';
import { FigureChooser } from '@/features/figures/FigureChooser';
import { useDiscovered } from '@/features/figures/discovery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tp } from '@/i18n/podcast';
import { clock } from '@/lib/clock';
import { capitalize } from '@/lib/text';
import { startWriting } from '@/podcast/writingState';
import {
  type EpisodeProblem,
  episodeProblem,
  figuresFor,
  newEpisode,
  TOPIC_MAX,
} from '@/services/podcast.service';
import { usePodcastStore } from '@/store/podcastStore';
import type { PodcastFormat } from '@/store/schemas';
import { charsForMinutes, formatEur, scriptEur, ttsEur } from '@/podcast/costs';
import { SetupCard } from './libraryParts';
import { BackToPodcasts } from './playerParts';
import { usePodcastKeys } from './usePodcastKeys';

const FORMATS: readonly PodcastFormat[] = ['monoloog', 'gesprek', 'interview'];
/** Een nieuwe aflevering aanvragen: vorm, denker(s), onderwerp en lengte. */
export function NewEpisodePage() {
  useDocumentTitle(tp.form.title);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const known = useDiscovered();
  const keys = usePodcastKeys();
  const [format, setFormat] = useState<PodcastFormat>('monoloog');
  const [figureIds, setFigureIds] = useState<string[]>(() => {
    const requested = params.get('denker');
    return requested && known.has(requested) ? [requested] : [];
  });
  const [topic, setTopic] = useState('');
  const [minutes, setMinutes] = useState<number>(PODCAST.defaultMinutes);
  const [placement, setPlacement] = useState<'hierna' | 'achteraan'>('achteraan');
  const [problem, setProblem] = useState<EpisodeProblem>();
  const ttsModel = usePodcastStore((s) => s.settings.ttsModel) ?? PODCAST.defaultTtsModel;
  const count = figuresFor(format);
  const ideas = [...new Set(figureIds.flatMap((id) => findMeta(id)?.helpsWith ?? []))].slice(0, 6);

  const chooseFormat = (next: PodcastFormat) => {
    setFormat(next);
    setFigureIds((ids) => ids.slice(0, figuresFor(next)));
    setProblem(undefined);
  };

  const submit = () => {
    const request = { format, figureIds, topic, minutes };
    const found = episodeProblem(request, known, keys.claude);
    if (found) {
      setProblem(found);
      return;
    }
    const store = usePodcastStore.getState();
    const episode = newEpisode(request, 'aanvraag', clock.iso());
    store.addEpisode(episode);
    store.enqueue(episode.id, placement);
    startWriting(episode.id);
    toast(tp.form.created, 'ok');
    navigate('/podcasts');
  };

  return (
    <div className="mx-auto max-w-3xl">
      <BackToPodcasts />
      <PageHeader title={tp.form.title} intro={tp.form.intro} />
      <SetupCard />
      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div>
          <p className="mb-1.5 font-medium">{tp.form.format}</p>
          <ChoiceChips<PodcastFormat>
            label={tp.form.format}
            value={format}
            onChange={chooseFormat}
            options={FORMATS.map((value) => ({ value, label: tp.formats[value] }))}
          />
        </div>

        <FigureChooser
          max={count}
          value={figureIds}
          onChange={(ids) => {
            setFigureIds(ids);
            setProblem(undefined);
          }}
          labels={{
            legend: count > 1 ? tp.form.figuresTwo : tp.form.figuresOne,
            hint: tp.form.figuresHint,
            search: tp.form.search,
            chosen: tp.form.chosen,
            unpick: tp.form.unpick,
            full: tp.form.full,
            noMatch: tp.form.noMatch,
            showAll: tp.form.showAll,
          }}
        />

        <div>
          <TextField
            label={tp.form.topic}
            hint={tp.form.topicHint}
            placeholder={tp.form.topicPlaceholder}
            maxLength={TOPIC_MAX}
            counter
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value);
              setProblem(undefined);
            }}
          />
          {ideas.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-2">
                <Lightbulb aria-hidden className="size-4 text-gold" />
                {tp.form.ideas}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {ideas.map((idea) => (
                  <li key={idea}>
                    <button
                      type="button"
                      aria-label={tp.form.useIdea(idea)}
                      onClick={() => setTopic(capitalize(idea).slice(0, TOPIC_MAX))}
                      className="rounded-full border border-line-strong bg-card px-3 py-1 text-sm text-ink-2 hover:bg-paper-2"
                    >
                      {idea}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <p className="mb-1.5 font-medium">{tp.form.length}</p>
          <ChoiceChips<string>
            label={tp.form.length}
            value={String(minutes)}
            onChange={(value) => setMinutes(Number(value))}
            options={PODCAST.lengths.map((value) => ({
              value: String(value),
              label: tp.meta.minutes(value),
            }))}
          />
          <p className="mt-2 text-sm text-ink-3">
            {tp.form.estimate(
              formatEur(scriptEur(minutes, figureIds.length || 1)),
              formatEur(ttsEur(charsForMinutes(minutes), ttsModel)),
              ttsModelInfo(ttsModel).label,
            )}
          </p>
        </div>

        <div>
          <p className="mb-1.5 font-medium">{tp.form.placement}</p>
          <ChoiceChips<'hierna' | 'achteraan'>
            label={tp.form.placement}
            value={placement}
            onChange={setPlacement}
            options={[
              { value: 'hierna', label: tp.form.placements.hierna },
              { value: 'achteraan', label: tp.form.placements.achteraan },
            ]}
          />
        </div>

        {problem && (
          <div className="space-y-3">
            <p role="alert" className="text-danger">
              {tp.problems[problem]}
            </p>
            {problem === 'crisis' && <CrisisCard />}
          </div>
        )}
        {keys.claude && !keys.elevenLabs && (
          <p className="text-sm text-ink-3">{tp.form.noVoiceKey}</p>
        )}
        <Button
          type="submit"
          size="lg"
          disabled={!keys.claude}
          icon={<PenLine aria-hidden className="size-4" />}
        >
          {tp.form.submit}
        </Button>
      </form>
    </div>
  );
}
