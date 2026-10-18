import { X } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { TextField } from '@/components/Field';
import { FIGURES_META, findMeta } from '@/data/figures';
import { cx } from '@/lib/cx';
import { normalize } from '@/lib/text';
import { useDiscovered } from './discovery';

const VISIBLE_FIGURES = 12;

export interface FigureChooserLabels {
  legend: string;
  hint: string;
  search: string;
  chosen: string;
  unpick: (name: string) => string;
  full: string;
  noMatch: string;
  showAll: (count: number) => string;
}

/**
 * Kies één denker of een paar (tot `max`), alleen wie je al kent. Bij één plek vervangt een nieuwe
 * keuze de oude; zit het vol, dan haal je eerst iemand weg.
 */
export function FigureChooser({
  max,
  value,
  onChange,
  labels,
}: {
  max: number;
  value: string[];
  onChange: (ids: string[]) => void;
  labels: FigureChooserLabels;
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
  const full = max > 1 && value.length >= max;

  const toggle = (id: string) => {
    if (value.includes(id)) onChange(value.filter((other) => other !== id));
    else if (max === 1) onChange([id]);
    else if (!full) onChange([...value, id]);
  };

  return (
    <fieldset>
      <legend className="font-medium">{labels.legend}</legend>
      <p className="text-sm text-ink-3">{labels.hint}</p>
      {value.length > 0 && (
        <ul aria-label={labels.chosen} className="mt-2 flex flex-wrap gap-2">
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
                  aria-label={labels.unpick(meta.name)}
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
        label={labels.search}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {full && <p className="mt-2 text-sm text-ink-3">{labels.full}</p>}
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
      {visible.length === 0 && <p className="mt-2 text-ink-3">{labels.noMatch}</p>}
      {!q && !showAll && matches.length > VISIBLE_FIGURES && (
        <Button className="mt-2" variant="ghost" size="sm" onClick={() => setShowAll(true)}>
          {labels.showAll(matches.length)}
        </Button>
      )}
    </fieldset>
  );
}
