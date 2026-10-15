import { BookOpen, Quote as QuoteIcon, RefreshCw, Sparkle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { AiLabel, Pill } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { NativeText } from '@/components/NativeText';
import { Thinking } from '@/components/Thinking';
import { toast } from '@/components/toastStore';
import { findMeta, type ResolvedLink } from '@/data/figures';
import { relationLabel, relationPhrase } from '@/data/figures/relations';
import type { Figure, Quote } from '@/data/types';
import { t } from '@/i18n/nl';
import { capitalize } from '@/lib/text';
import { useThoughtOfTheDay } from '@/services/thought.service';
import { useProfileStore } from '@/store/profileStore';
import { MysteryAvatar } from './components';

const STATUS_TONE = { authentiek: 'ok', parafrase: 'warn', toegeschreven: 'neutral' } as const;

export function QuoteCard({ quote }: { quote: Quote }) {
  return (
    <Card as="article" className="relative overflow-hidden">
      <QuoteIcon aria-hidden className="absolute top-4 right-4 size-8 text-fig/15" />
      <figure>
        <blockquote className="pr-8 font-fig text-2xl leading-snug text-fig sm:text-[1.65rem]">
          {quote.text}
        </blockquote>
        {quote.original && (
          <p className="mt-2 text-ink-3 italic">
            <NativeText text={quote.original} />
          </p>
        )}
        <figcaption className="mt-3 flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <cite className="not-italic">{quote.source}</cite>
          <Pill tone={STATUS_TONE[quote.status]}>{t.figures.quoteStatus[quote.status]}</Pill>
          <span className="text-xs text-ink-3">
            {quote.translation === 'eigen' ? t.figures.ownTranslation : t.figures.pdTranslation}
          </span>
        </figcaption>
        {quote.note && <p className="mt-2 text-sm text-ink-3">{quote.note}</p>}
      </figure>
    </Card>
  );
}

export function SpecCard({ label, value }: { label: string; value: string }) {
  return (
    <Card as="article" className="border-l-4 border-l-fig">
      <p className="text-xs font-semibold tracking-wide text-fig uppercase">{label}</p>
      <p className="mt-1 text-lg">{value}</p>
    </Card>
  );
}

export function Lifeline({ figure }: { figure: Figure }) {
  return (
    <ol className="relative ml-3 border-l-2 border-fig/30">
      {figure.lifeEvents.map((event) => (
        <li
          key={`${event.year}-${event.text.slice(0, 24)}`}
          className="relative pb-5 pl-6 last:pb-0"
        >
          <span
            aria-hidden
            className="absolute top-1.5 -left-[7px] size-3 rounded-full border-2 border-card bg-fig"
          />
          <p className="font-display text-lg font-semibold text-fig">{event.year}</p>
          <p className="text-ink-2">{event.text}</p>
        </li>
      ))}
    </ol>
  );
}

export function ConceptList({ figure }: { figure: Figure }) {
  return (
    <dl className="grid gap-3 sm:grid-cols-2">
      {figure.keyConcepts.map((concept) => (
        <div key={concept.term} className="rounded-xl border border-line bg-card p-3.5">
          <dt className="font-display text-xl font-semibold text-fig">
            {concept.term}
            {concept.native && (
              <span className="ml-2 text-base font-normal text-ink-3">
                <NativeText text={concept.native} />
              </span>
            )}
          </dt>
          <dd className="mt-1 text-ink-2">{concept.explanation}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ThoughtCard({ figure }: { figure: Figure }) {
  const { thought, status, load, automatic } = useThoughtOfTheDay(figure);
  return (
    <Card as="section" aria-labelledby="gedachte" className="border-fig/30 bg-fig-surface">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="gedachte" className="flex items-center gap-2 text-2xl">
          <Sparkle aria-hidden className="size-5 text-fig-accent" />
          {t.figures.thoughtOfTheDay}
        </h2>
        <AiLabel />
      </div>
      <div className="mt-3" aria-live="polite">
        {status === 'ready' && thought && (
          <p className="font-fig text-2xl leading-snug text-fig">{thought.text}</p>
        )}
        {status === 'loading' && <Thinking text={figure.microcopy.thinking} />}
        {status === 'idle' && !automatic && (
          <Button variant="figure-outline" onClick={load}>
            {t.figures.thoughtCta}
          </Button>
        )}
        {status === 'error' && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-ink-2">Vandaag kwam er geen gedachte door.</p>
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw aria-hidden className="size-4" />}
              onClick={load}
            >
              Probeer opnieuw
            </Button>
          </div>
        )}
      </div>
      <p className="mt-3 text-xs text-ink-3">
        Eén gedachte per dag, in de stijl van {figure.shortName ?? figure.name}: geen echt citaat.
      </p>
    </Card>
  );
}

function NetworkItem({ link, of, known }: { link: ResolvedLink; of: string; known: boolean }) {
  const navigate = useNavigate();
  const discover = useProfileStore((s) => s.discover);
  const meta = findMeta(link.id);
  if (!meta) return null;
  if (!known) {
    return (
      <li className="flex items-center gap-3 rounded-xl border border-dashed border-line-strong p-2.5">
        <MysteryAvatar size={40} />
        <div className="min-w-0 flex-1">
          <p className="font-medium text-ink-2">{t.figures.undiscovered}</p>
          <p className="text-sm text-ink-3">
            {capitalize(relationPhrase(link.relation, of))}
            {link.note ? ` · ${link.note}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (discover(meta.id)) toast(t.figures.newlyDiscovered(meta.name), 'ok');
            navigate(`/denkers/${meta.id}`);
          }}
          className="inline-flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-line-strong bg-card px-3 text-sm font-medium hover:bg-paper-2"
        >
          <Sparkle aria-hidden className="size-4 text-gold" />
          Ontdek
        </button>
      </li>
    );
  }
  return (
    <li className="relative flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-paper-2">
      <Avatar figure={meta} size={40} />
      <div className="min-w-0">
        <Link
          to={`/denkers/${meta.id}`}
          className="font-medium after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-info"
        >
          {meta.name}
        </Link>
        <p className="text-sm text-ink-3">
          {relationLabel(link.relation)}
          {link.note ? ` · ${link.note}` : ''}
        </p>
      </div>
    </li>
  );
}

export function NetworkList({
  links,
  of,
  known,
}: {
  links: readonly ResolvedLink[];
  of: string;
  known: ReadonlySet<string>;
}) {
  return (
    <ul className="space-y-1.5">
      {links.map((link) => (
        <NetworkItem key={link.id} link={link} of={of} known={known.has(link.id)} />
      ))}
    </ul>
  );
}

export function WorksList({ figure }: { figure: Figure }) {
  return (
    <ul className="space-y-2.5">
      {figure.keyWorks.map((work) => (
        <li key={work.title} className="flex gap-2.5">
          <BookOpen aria-hidden className="mt-1 size-4 shrink-0 text-fig" />
          <div>
            <p className="font-medium">
              <cite className="not-italic">{work.title}</cite>
              {work.year && <span className="font-normal text-ink-3"> ({work.year})</span>}
            </p>
            {work.note && <p className="text-sm text-ink-3">{work.note}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
