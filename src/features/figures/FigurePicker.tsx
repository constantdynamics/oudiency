import { Search } from 'lucide-react';
import { useDeferredValue, useState } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { TextField } from '@/components/Field';
import { FIGURES_META } from '@/data/figures';
import { lifespanOf } from '@/data/figures/format';
import { t } from '@/i18n/nl';
import { normalize } from '@/lib/text';
import { useDiscovered } from './discovery';

/** Kies een denker (alleen wie je al kent), bijvoorbeeld om te boeken of een college aan te vragen. */
export function FigurePicker({
  title,
  hint,
  linkTo,
}: {
  title: string;
  hint: string;
  linkTo: (figureId: string) => string;
}) {
  const known = useDiscovered();
  const [query, setQuery] = useState('');
  const q = normalize(useDeferredValue(query));
  const figures = FIGURES_META.filter(
    (meta) =>
      known.has(meta.id) &&
      (!q || normalize(`${meta.name} ${meta.epithet} ${meta.tags.join(' ')}`).includes(q)),
  );
  return (
    <section aria-labelledby="kies-denker">
      <h2 id="kies-denker" className="text-2xl">
        {title}
      </h2>
      <p className="mt-1 text-ink-2">{hint}</p>
      <TextField
        className="mt-4 sm:w-80"
        label={t.figures.search}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {figures.map((meta) => (
          <li key={meta.id}>
            <Link
              to={linkTo(meta.id)}
              className="flex items-center gap-3 rounded-2xl border border-line bg-card p-3 shadow-card transition-shadow hover:shadow-lift focus-visible:outline-3 focus-visible:outline-info"
            >
              <Avatar figure={meta} size={48} />
              <span className="min-w-0">
                <span className="block truncate font-display text-lg font-semibold">
                  {meta.name}
                </span>
                <span className="block truncate text-sm text-ink-3">
                  {lifespanOf(meta)} · {meta.epithet}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {figures.length === 0 && (
        <p className="mt-4 flex items-center gap-2 text-ink-3">
          <Search aria-hidden className="size-4" />
          {t.sessions.noFigures}
        </p>
      )}
    </section>
  );
}
