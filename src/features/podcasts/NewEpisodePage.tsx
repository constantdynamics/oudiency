import { Lightbulb, PenLine, X } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/Chips';
import { CrisisCard } from '@/components/CrisisCard';
import { TextField } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { toast } from '@/components/toastStore';
import { PODCAST } from '@/config/podcast';
import { FIGURES_META, findMeta } from '@/data/figures';
import { useDiscovered } from '@/features/figures/discovery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tp } from '@/i18n/podcast';
import { clock } from '@/lib/clock';
import { cx } from '@/lib/cx';
import { capitalize, normalize } from '@/lib/text';
import { startWriting } from '@/podcast/writingState';
import {
  type EpisodeProblem,
  estimatedCreditsFor,
  episodeProblem,
  figuresFor,
  newEpisode,
  TOPIC_MAX,
} from '@/services/podcast.service';
import { usePodcastStore } from '@/store/podcastStore';
import type { PodcastFormat } from '@/store/schemas';
import { formatCredits } from '@/voice/format';
import { SetupCard } from './libraryParts';
import { BackToPodcasts } from './playerParts';
import { usePodcastKeys } from './usePodcastKeys';

const FORMATS: readonly PodcastFormat[] = ['monoloog', 'gesprek', 'interview'];
const VISIBLE_FIGURES = 12;

/** Kies één denker, of twee voor een gesprek (alleen wie je al kent). */
function FigureChooser({
  count,
  value,
  onChange,
}: {
  count: number;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const known = useDiscovered();
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const q = normalize(useDeferredValue(query));
  const matches = FIGURES_META.filter(
    (meta) =>
      known.has(meta.id) &&
      (!q || normalize(`${meta.name} ${meta.epithet} ${meta.tags.join(' ')}`).includes(q)),
  );
  const visible = q || showAll ? matches : matches.slice(0, VISIBLE_FIGURES);
  const full = count > 1 && value.length >= count;

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((other) => other !== id));
    else if (count === 1) onChange([id]);
    else if (!full) onChange([...value, id]);
  };

  return (
    <fieldset>
      <legend className="font-medium">{count > 1 ? tp.form.figuresTwo : tp.form.figuresOne}</legend>
      <p className="text-sm text-ink-3">{tp.form.figuresHint}</p>
      {value.length > 0 && (
        <ul aria-label={tp.form.chosen} className="mt-2 flex flex-wrap gap-2">
          {value.map((id) => {
            const meta = findMeta(id);
            if (!meta) return null;
            return (
              <li
                key={id}
                className="inline-flex items-center gap-2 rounded-full border border-ink bg-ink py-1 pr-1 pl-1 text-paper"
              >
                <Avatar figure={meta} size={28} />
                <span className="font-medium">{meta.shortName ?? meta.name}</span>
                <button
                  type="button"
                  aria-label={tp.form.unpick(meta.name)}
                  onClick={() => toggle(id)}
                  className="inline-flex size-8 items-center justify-center rounded-full hover:bg-white/15"
                >
                  <X aria-hidden className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
      <TextField
        className="mt-3 sm:w-80"
        label={tp.form.search}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {full && <p className="mt-2 text-sm text-ink-3">{tp.form.full}</p>}
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {visible.map((meta) => {
          const selected = value.includes(meta.id);
          const blocked = full && !selected;
          return (
            <li key={meta.id}>
              <button
                type="button"
                aria-pressed={selected}
                aria-disabled={blocked || undefined}
                onClick={() => toggle(meta.id)}
                className={cx(
                  'flex w-full items-center gap-3 rounded-xl border p-2 text-left transition-colors',
                  selected ? 'border-ink bg-paper-2' : 'border-line bg-card hover:bg-paper-2',
                  blocked && 'opacity-50',
                )}
              >
                <Avatar figure={meta} size={36} />
                <span className="min-w-0">
                  <span className="block truncate font-medium">{meta.name}</span>
                  <span className="block truncate text-sm text-ink-3">{meta.epithet}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 && <p className="mt-2 text-ink-3">{tp.form.noMatch}</p>}
      {!q && !showAll && matches.length > VISIBLE_FIGURES && (
        <Button className="mt-2" variant="ghost" size="sm" onClick={() => setShowAll(true)}>
          {tp.form.showAll(matches.length)}
        </Button>
      )}
    </fieldset>
  );
}

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
          count={count}
          value={figureIds}
          onChange={(ids) => {
            setFigureIds(ids);
            setProblem(undefined);
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
            {tp.form.estimate(formatCredits(estimatedCreditsFor(minutes)))}
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
