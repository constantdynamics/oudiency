import { Compass, Search } from 'lucide-react';
import { useDeferredValue, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { ChoiceChips } from '@/components/Chips';
import { EmptyState } from '@/components/EmptyState';
import { TextField } from '@/components/Field';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import {
  CORE_META,
  FIGURES_META,
  NETWORK_META,
  TOTAL_FIGURES,
  type FigureMeta,
} from '@/data/figures';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';
import { normalize } from '@/lib/text';
import { useProfileStore } from '@/store/profileStore';
import { FigureCard, TeaserCard } from './components';
import { frontier, teaserHint, useDiscovered } from './discovery';

type Filter = 'alle' | 'gevolgd' | 'kern' | 'netwerk';

const FRONTIER_PREVIEW = 6;

function searchable(meta: FigureMeta): string {
  return normalize(
    [
      meta.name,
      meta.shortName,
      meta.nativeName,
      meta.epithet,
      meta.school,
      meta.origin,
      ...meta.tags,
      ...meta.helpsWith,
    ]
      .filter(Boolean)
      .join(' '),
  );
}

function DiscoveryProgress({ count, total }: { count: number; total: number }) {
  const percent = Math.round((count / total) * 100);
  return (
    <div className="rounded-2xl border border-line bg-card p-4 sm:flex sm:items-center sm:gap-5">
      <p className="font-display text-2xl font-semibold">
        {t.figures.discoveredCount(count, total)}
      </p>
      <div className="mt-2 flex-1 sm:mt-0">
        <div
          className="h-2.5 overflow-hidden rounded-full bg-paper-2"
          role="progressbar"
          aria-label="Ontdekte denkers"
          aria-valuemin={0}
          aria-valuemax={total}
          aria-valuenow={count}
        >
          <div className="h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
        </div>
        <p className="mt-1 text-sm text-ink-3">
          Ontdek nieuwe denkers via de netwerken op de profielen, reacties op je timeline en de
          denker van de dag.
        </p>
      </div>
    </div>
  );
}

export function FiguresPage() {
  useDocumentTitle(t.figures.title);
  const known = useDiscovered();
  const follows = useProfileStore((s) => s.profile.follows);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);
  const [filter, setFilter] = useState<Filter>('alle');
  const [tag, setTag] = useState<string>('');
  const [showAllFrontier, setShowAllFrontier] = useState(false);

  const q = normalize(deferredQuery);
  const visible = (meta: FigureMeta) =>
    known.has(meta.id) &&
    (filter !== 'gevolgd' || follows.includes(meta.id)) &&
    (!tag || meta.tags.includes(tag)) &&
    (!q || searchable(meta).includes(q));

  const core = CORE_META.filter(visible);
  const network = NETWORK_META.filter(visible);
  const showCore = filter !== 'netwerk';
  const showNetwork = filter !== 'kern';

  // Thema-chips: de vaakst voorkomende thema's onder wat je al kent.
  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const meta of FIGURES_META) {
      if (!known.has(meta.id)) continue;
      for (const tg of meta.tags) counts.set(tg, (counts.get(tg) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'nl'))
      .slice(0, 10)
      .map(([name]) => name);
  }, [known]);

  const edge = useMemo(() => frontier(known), [known]);
  const edgeVisible = edge.filter(
    (meta) =>
      (!tag || meta.tags.includes(tag)) &&
      (!q ||
        meta.tags.some((tg) => normalize(tg).includes(q)) ||
        normalize(meta.school).includes(q)),
  );
  const farAway = TOTAL_FIGURES - known.size - edge.length;
  const undiscoveredMatches = q
    ? FIGURES_META.filter((meta) => !known.has(meta.id) && searchable(meta).includes(q)).length
    : 0;

  const nothingFound = core.length === 0 && network.length === 0;

  return (
    <>
      <PageHeader title={t.figures.title} intro={t.figures.intro} />
      <DiscoveryProgress count={known.size} total={TOTAL_FIGURES} />

      <div role="search" className="mt-6 space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <TextField
            label={t.figures.search}
            type="search"
            placeholder="Naam, thema of stroming"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="sm:w-80"
          />
          <ChoiceChips<Filter>
            label="Welke denkers"
            value={filter}
            onChange={setFilter}
            options={[
              { value: 'alle', label: t.figures.filterAll },
              { value: 'gevolgd', label: t.figures.filterFollowed, count: follows.length },
              { value: 'kern', label: t.figures.core },
              { value: 'netwerk', label: t.figures.network },
            ]}
          />
        </div>
        {topTags.length > 0 && (
          <ChoiceChips<string>
            label="Thema"
            value={tag}
            onChange={(value) => setTag(value === tag ? '' : value)}
            options={[
              { value: '', label: 'Alle thema’s' },
              ...topTags.map((tg) => ({ value: tg, label: tg })),
            ]}
          />
        )}
      </div>

      {nothingFound && (
        <EmptyState
          className="mt-8"
          icon={<Search aria-hidden className="size-8" />}
          title={
            filter === 'gevolgd' && !q && !tag ? 'Je volgt nog niemand' : 'Geen denkers gevonden'
          }
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery('');
                setTag('');
                setFilter('alle');
              }}
            >
              Toon alle denkers
            </Button>
          }
        >
          {filter === 'gevolgd' && !q && !tag
            ? 'Volg denkers via hun kaart of profiel; zij stellen dan vaker de vraag van de dag en reageren eerder op je timeline.'
            : undiscoveredMatches > 0
              ? `Onder de denkers die je nog niet hebt ontdekt, passen er ${undiscoveredMatches} bij je zoekopdracht. Ontdek ze via de netwerken.`
              : 'Probeer een andere naam of een ander thema.'}
        </EmptyState>
      )}

      {showCore && core.length > 0 && (
        <section aria-labelledby="kerndenkers" className="mt-10">
          <SectionTitle id="kerndenkers">{t.figures.core}</SectionTitle>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {core.map((meta) => (
              <li key={meta.id}>
                <FigureCard meta={meta} variant="large" />
              </li>
            ))}
          </ul>
        </section>
      )}

      {showNetwork && network.length > 0 && (
        <section aria-labelledby="netwerk" className="mt-10">
          <SectionTitle id="netwerk">Ontdekt in het netwerk</SectionTitle>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {network.map((meta) => (
              <li key={meta.id}>
                <FigureCard meta={meta} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {showNetwork && filter !== 'gevolgd' && edgeVisible.length > 0 && (
        <section aria-labelledby="te-ontdekken" className="mt-10">
          <SectionTitle id="te-ontdekken">Nog te ontdekken</SectionTitle>
          <p className="-mt-1 mb-4 max-w-2xl text-ink-2">
            Deze denkers horen bij het netwerk van wie je al kent. Wie zijn het?
          </p>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {(showAllFrontier ? edgeVisible : edgeVisible.slice(0, FRONTIER_PREVIEW)).map(
              (meta) => (
                <li key={meta.id}>
                  <TeaserCard meta={meta} hint={teaserHint(meta.id, known)} />
                </li>
              ),
            )}
          </ul>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {!showAllFrontier && edgeVisible.length > FRONTIER_PREVIEW && (
              <Button variant="secondary" onClick={() => setShowAllFrontier(true)}>
                Toon alle {edgeVisible.length}
              </Button>
            )}
            {farAway > 0 && (
              <p className="inline-flex items-center gap-2 text-sm text-ink-3">
                <Compass aria-hidden className="size-4" />
                En nog {farAway} denkers verder weg in het netwerk.
              </p>
            )}
          </div>
        </section>
      )}
    </>
  );
}
