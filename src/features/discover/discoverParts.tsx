import {
  BookOpenText,
  CalendarPlus,
  Clock,
  Heart,
  Search,
  Sparkles,
  UserRound,
  X,
} from 'lucide-react';
import { useId, useState } from 'react';
import { Link } from 'react-router';
import { detectCrisisSignals } from '@/ai/prompts/safety';
import { Avatar } from '@/components/Avatar';
import { AiLabel, ExampleBadge, Pill } from '@/components/Badges';
import { Button, ButtonLink } from '@/components/Button';
import { CrisisCard } from '@/components/CrisisCard';
import { ThemeFrame } from '@/components/ThemeFrame';
import { Thinking } from '@/components/Thinking';
import { CORE_IDS, figureName, findMeta, FIGURES_META, type FigureMeta } from '@/data/figures';
import { lifespanOf } from '@/data/figures/format';
import { t } from '@/i18n/nl';
import type { HelperSuggestion, LectureFilters, LengthBucket } from '@/services/discover.service';
import { useProfileStore } from '@/store/profileStore';
import type { LectureSummary } from '../lectures/summary';

/** Een college als kaart (met het begin van de opening). */
export function LectureCard({ lecture }: { lecture: LectureSummary }) {
  const meta = findMeta(lecture.figureId);
  if (!meta) return null;
  return (
    <ThemeFrame
      figure={meta}
      as="article"
      className="relative flex flex-col rounded-2xl border border-line bg-card p-4 shadow-card transition-shadow hover:shadow-lift"
    >
      <div className="flex items-center gap-3">
        <Avatar figure={meta} size={40} />
        <p className="min-w-0 truncate text-sm text-ink-3">{meta.name}</p>
      </div>
      <h3 className="mt-3 font-fig text-xl leading-snug text-fig">
        <Link
          to={`/colleges/${lecture.id}`}
          className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-info"
        >
          {lecture.title}
        </Link>
      </h3>
      <p className="mt-1 text-sm text-ink-2">{lecture.mainQuestion}</p>
      {lecture.teaser && <p className="mt-2 line-clamp-3 text-sm text-ink-3">{lecture.teaser}</p>}
      <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3 text-xs text-ink-3">
        <span className="inline-flex items-center gap-1">
          <Clock aria-hidden className="size-3.5" />
          {lecture.minutes} min
        </span>
        {lecture.isExample && <ExampleBadge />}
        {lecture.liked && (
          <span className="inline-flex items-center gap-1 text-terracotta">
            <Heart aria-hidden className="size-3.5 fill-current" />
            <span className="sr-only">Je vindt dit college leuk</span>
          </span>
        )}
      </div>
    </ThemeFrame>
  );
}

function HelperCard({ suggestion, isNew }: { suggestion: HelperSuggestion; isNew: boolean }) {
  const meta = findMeta(suggestion.figureId);
  if (!meta) return null;
  return (
    <ThemeFrame
      figure={meta}
      as="li"
      className="rounded-2xl border border-line bg-card p-4 shadow-card"
    >
      <div className="flex items-start gap-3">
        <Avatar figure={meta} size={48} decorative={false} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xl font-semibold text-fig">{meta.name}</span>
            {isNew && <Pill tone="gold">{t.discover.newFigure}</Pill>}
          </p>
          <p className="text-sm text-ink-3">
            {lifespanOf(meta)} · {meta.epithet}
          </p>
          <p className="mt-2">{suggestion.why}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <ButtonLink
              to={`/sessies/boeken/${meta.id}`}
              variant="figure"
              size="sm"
              icon={<CalendarPlus aria-hidden className="size-4" />}
            >
              {t.discover.planSession}
            </ButtonLink>
            <ButtonLink
              to={`/colleges/aanvragen/${meta.id}`}
              variant="figure-outline"
              size="sm"
              icon={<BookOpenText aria-hidden className="size-4" />}
            >
              {t.discover.requestLecture}
            </ButtonLink>
            <ButtonLink to={`/denkers/${meta.id}`} variant="ghost" size="sm">
              {t.discover.viewProfile}
            </ButtonLink>
          </div>
        </div>
      </div>
    </ThemeFrame>
  );
}

type HelpState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'crisis' }
  | { status: 'error' }
  | { status: 'done'; suggestions: HelperSuggestion[]; newIds: string[] };

/** "Wie kan mij helpen?": drie denkers met één zin waarom (wie nieuw is, ontdek je zo). */
export function HelpMe() {
  const id = useId();
  const [query, setQuery] = useState('');
  const [state, setState] = useState<HelpState>({ status: 'idle' });

  const submit = async () => {
    const text = query.trim();
    if (!text) return;
    if (detectCrisisSignals(text)) {
      setState({ status: 'crisis' });
      return;
    }
    setState({ status: 'loading' });
    try {
      const { findHelpers } = await import('@/services/helperAi');
      const suggestions = await findHelpers(text);
      // Wie je nog niet kende, ontdek je zo (kerndenkers ken je al).
      const profile = useProfileStore.getState();
      const newIds = suggestions
        .map((s) => s.figureId)
        .filter((figureId) => !CORE_IDS.includes(figureId) && profile.discover(figureId));
      setState({ status: 'done', suggestions, newIds });
    } catch (error) {
      console.warn('[ontdekken] wie kan mij helpen mislukt', error);
      setState({ status: 'error' });
    }
  };

  return (
    <section aria-labelledby={`${id}-titel`} className="space-y-4">
      <form
        className="rounded-3xl border border-line bg-card p-5 shadow-card sm:p-6"
        onSubmit={(event) => {
          event.preventDefault();
          void submit();
        }}
      >
        <h2 id={`${id}-titel`} className="flex items-center gap-2 text-2xl">
          <Sparkles aria-hidden className="size-5 text-gold" />
          {t.discover.helpMe}
        </h2>
        <p className="mt-1 text-ink-2">{t.discover.helpMeIntro}</p>
        <label htmlFor={`${id}-vraag`} className="sr-only">
          {t.discover.helpMeLabel}
        </label>
        <textarea
          id={`${id}-vraag`}
          rows={2}
          maxLength={300}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.discover.helpMePlaceholder}
          className="mt-3 w-full resize-y rounded-xl border border-line-strong bg-paper px-3.5 py-2.5 leading-relaxed text-ink placeholder:text-ink-3 focus:border-ink-2 focus:outline-none focus-visible:outline-3 focus-visible:outline-info"
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            type="submit"
            disabled={!query.trim() || state.status === 'loading'}
            icon={<UserRound aria-hidden className="size-4" />}
          >
            {t.discover.helpMeSubmit}
          </Button>
          {state.status === 'loading' && <Thinking text={t.discover.helpMeSearching} />}
          {state.status === 'error' && (
            <p role="alert" className="text-danger">
              {t.discover.helpMeError}
            </p>
          )}
        </div>
      </form>
      {state.status === 'crisis' && <CrisisCard />}
      {state.status === 'done' && state.suggestions.length > 0 && (
        <div aria-live="polite">
          <h3 className="mb-2 flex flex-wrap items-center gap-2 text-xl">
            {t.discover.helpMeResults}
            <AiLabel />
          </h3>
          <ul className="grid gap-3 lg:grid-cols-3">
            {state.suggestions.map((suggestion) => (
              <HelperCard
                key={suggestion.figureId}
                suggestion={suggestion}
                isNew={state.newIds.includes(suggestion.figureId)}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Denker van de dag: bij voorkeur iemand die je nog niet kent. */
export function FigureOfTheDayCard({
  meta,
  known,
  hint,
}: {
  meta: FigureMeta;
  known: boolean;
  hint?: string;
}) {
  return (
    <ThemeFrame
      figure={meta}
      motif
      as="section"
      className="relative rounded-3xl border border-line bg-fig-surface p-5 shadow-card sm:p-6"
    >
      <p className="text-sm font-medium tracking-wide text-fig uppercase">
        {t.discover.figureOfTheDay}
      </p>
      <div className="mt-3 flex items-center gap-4">
        <Avatar figure={meta} size={72} decorative={false} />
        <div className="min-w-0">
          <h2 className="font-fig text-3xl leading-tight text-fig">
            <Link
              to={`/denkers/${meta.id}`}
              className="after:absolute after:inset-0 after:rounded-3xl focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-info"
            >
              {meta.name}
            </Link>
          </h2>
          <p className="text-ink-2">
            {lifespanOf(meta)} · {meta.epithet}
          </p>
        </div>
      </div>
      {hint && <p className="mt-3 text-ink-2">{t.discover.figureOfTheDayHint(hint)}</p>}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {!known && <Pill tone="gold">{t.discover.undiscovered}</Pill>}
        {meta.tags.slice(0, 3).map((tag) => (
          <Pill key={tag} tone="figure">
            {tag}
          </Pill>
        ))}
      </div>
    </ThemeFrame>
  );
}

const LENGTHS: { value: LengthBucket; label: string }[] = [
  { value: 'kort', label: t.discover.lengthShort },
  { value: 'middel', label: t.discover.lengthMedium },
  { value: 'lang', label: t.discover.lengthLong },
];

const SELECT =
  'w-full rounded-xl border border-line-strong bg-card px-3 py-2.5 text-ink focus:border-ink-2 focus:outline-none focus-visible:outline-3 focus-visible:outline-info';

/** Zoeken in colleges, met filters op denker, thema en lengte. */
export function SearchPanel({
  filters,
  themes,
  figureIds,
  onChange,
  onClear,
}: {
  filters: LectureFilters;
  themes: readonly string[];
  figureIds: readonly string[];
  onChange: (patch: Partial<LectureFilters>) => void;
  onClear: () => void;
}) {
  const id = useId();
  const figures = FIGURES_META.filter((m) => figureIds.includes(m.id));
  const active = Boolean(filters.query || filters.figureId || filters.theme || filters.length);
  return (
    <form
      role="search"
      aria-label={t.discover.search}
      className="space-y-3"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="relative">
        <Search
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-3"
        />
        <label htmlFor={`${id}-zoek`} className="sr-only">
          {t.discover.search}
        </label>
        <input
          id={`${id}-zoek`}
          type="search"
          value={filters.query ?? ''}
          onChange={(event) => onChange({ query: event.target.value })}
          placeholder={`${t.discover.search} …`}
          className={`${SELECT} pl-10`}
        />
      </div>
      <fieldset className="grid gap-2 sm:grid-cols-3">
        <legend className="sr-only">{t.discover.filters}</legend>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-2">{t.discover.filterFigure}</span>
          <select
            className={SELECT}
            value={filters.figureId ?? ''}
            onChange={(event) => onChange({ figureId: event.target.value || undefined })}
          >
            <option value="">{t.discover.allFigures}</option>
            {figures.map((meta) => (
              <option key={meta.id} value={meta.id}>
                {meta.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-2">{t.discover.filterTheme}</span>
          <select
            className={SELECT}
            value={filters.theme ?? ''}
            onChange={(event) => onChange({ theme: event.target.value || undefined })}
          >
            <option value="">{t.discover.allThemes}</option>
            {themes.map((theme) => (
              <option key={theme} value={theme}>
                {theme}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-medium text-ink-2">{t.discover.filterLength}</span>
          <select
            className={SELECT}
            value={filters.length ?? ''}
            onChange={(event) =>
              onChange({ length: (event.target.value || undefined) as LengthBucket | undefined })
            }
          >
            <option value="">{t.discover.allLengths}</option>
            {LENGTHS.map((length) => (
              <option key={length.value} value={length.value}>
                {length.label}
              </option>
            ))}
          </select>
        </label>
      </fieldset>
      {active && (
        <Button
          variant="ghost"
          size="sm"
          icon={<X aria-hidden className="size-4" />}
          onClick={onClear}
        >
          {t.discover.clearFilters}
        </Button>
      )}
    </form>
  );
}

/** Onderwerpen als chips die het themafilter zetten. */
export function TopicChips({ topics }: { topics: readonly string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {topics.map((topic) => (
        <li key={topic}>
          <Link
            to={`/?thema=${encodeURIComponent(topic)}`}
            className="inline-flex rounded-full border border-line-strong bg-card px-3 py-1.5 text-sm text-ink-2 transition-colors hover:bg-paper-2 hover:text-ink focus-visible:outline-3 focus-visible:outline-info"
          >
            #{topic}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Populaire vragen: de hoofdvragen van de topcolleges. */
export function QuestionList({ lectures }: { lectures: readonly LectureSummary[] }) {
  return (
    <ul className="space-y-2">
      {lectures.map((lecture) => (
        <li key={lecture.id}>
          <Link
            to={`/colleges/${lecture.id}`}
            className="block rounded-xl border border-line bg-card px-4 py-3 transition-colors hover:bg-paper-2 focus-visible:outline-3 focus-visible:outline-info"
          >
            <span className="font-fig text-lg text-ink">{lecture.mainQuestion}</span>
            <span className="mt-0.5 block text-sm text-ink-3">{figureName(lecture.figureId)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
