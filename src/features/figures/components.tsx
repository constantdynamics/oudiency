import { Check, HelpCircle, Plus, Sparkle } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Pill } from '@/components/Badges';
import { NativeText } from '@/components/NativeText';
import { ThemeFrame } from '@/components/ThemeFrame';
import { toast } from '@/components/toastStore';
import { figureName, type FigureMeta } from '@/data/figures';
import { t } from '@/i18n/nl';
import { cx } from '@/lib/cx';
import { lifespanOf } from '@/data/figures/format';
import { useProfileStore } from '@/store/profileStore';

/** Volgen of ontvolgen (gevolgde denkers stellen vaker de dagvraag en reageren eerder). */
export function FollowButton({
  figureId,
  className,
  size = 'sm',
}: {
  figureId: string;
  className?: string;
  size?: 'sm' | 'md';
}) {
  const following = useProfileStore((s) => s.profile.follows.includes(figureId));
  const toggleFollow = useProfileStore((s) => s.toggleFollow);
  const name = figureName(figureId);
  return (
    <button
      type="button"
      aria-pressed={following}
      aria-label={following ? `${name} niet meer volgen` : `${name} volgen`}
      onClick={() => {
        toggleFollow(figureId);
        toast(following ? `Je volgt ${name} niet meer.` : `Je volgt nu ${name}.`, 'ok');
      }}
      className={cx(
        'relative z-10 inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors',
        size === 'sm' ? 'min-h-9 px-3.5 text-sm' : 'min-h-11 px-5',
        following
          ? 'border-fig bg-fig text-white hover:opacity-90'
          : 'border-fig bg-card text-fig hover:bg-fig-surface',
        className,
      )}
    >
      {following ? (
        <Check aria-hidden className="size-4" />
      ) : (
        <Plus aria-hidden className="size-4" />
      )}
      {following ? t.figures.following : t.figures.follow}
    </button>
  );
}

/** Medaillon voor een denker die je nog niet hebt ontdekt. */
export function MysteryAvatar({ size = 56, className }: { size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        'inline-flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-line-strong bg-paper-2 text-ink-3',
        className,
      )}
      style={{ width: size, height: size }}
    >
      <HelpCircle className="size-1/2" strokeWidth={1.5} />
    </span>
  );
}

/** Kaart van een (ontdekte) denker in het overzicht. */
export function FigureCard({
  meta,
  variant = 'compact',
  isNew = false,
}: {
  meta: FigureMeta;
  variant?: 'large' | 'compact';
  isNew?: boolean;
}) {
  const large = variant === 'large';
  return (
    <ThemeFrame
      as="article"
      figure={meta}
      motif={large}
      className="group relative flex h-full flex-col rounded-2xl border border-line bg-fig-surface p-4 shadow-card transition-shadow hover:shadow-lift sm:p-5"
    >
      <div className="flex items-start gap-3.5">
        <Avatar figure={meta} size={large ? 72 : 56} />
        <div className="min-w-0">
          <h3 className={cx('font-fig leading-tight text-fig', large ? 'text-3xl' : 'text-2xl')}>
            <Link
              to={`/denkers/${meta.id}`}
              className="after:absolute after:inset-0 after:rounded-2xl focus-visible:outline-none focus-visible:after:outline-3 focus-visible:after:outline-info"
            >
              {meta.name}
            </Link>
          </h3>
          {meta.nativeName && meta.nativeScript !== 'latin' && (
            <NativeText text={meta.nativeName} className="text-lg text-fig" />
          )}
          <p className="text-sm text-ink-2">{lifespanOf(meta)}</p>
        </div>
        {isNew && (
          <Pill tone="gold" className="ml-auto" icon={<Sparkle aria-hidden className="size-3" />}>
            Nieuw
          </Pill>
        )}
      </div>
      <p className={cx('mt-3 text-ink-2', large ? 'text-base' : 'text-sm')}>{meta.epithet}</p>
      {large && (
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Thema's">
          {meta.tags.slice(0, 4).map((tag) => (
            <li key={tag}>
              <Pill tone="figure">{tag}</Pill>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="text-xs text-ink-3">{meta.school}</span>
        <FollowButton figureId={meta.id} />
      </div>
    </ThemeFrame>
  );
}

/**
 * Teaser voor een nog niet ontdekte denker: geen naam, wel een hint ("leerling van Socrates").
 * Ontdekken markeert de denker als ontdekt en opent het profiel.
 */
export function TeaserCard({
  meta,
  hint,
  className,
}: {
  meta: FigureMeta;
  hint?: string;
  className?: string;
}) {
  const navigate = useNavigate();
  const discover = useProfileStore((s) => s.discover);
  return (
    <article
      className={cx(
        'flex h-full flex-col rounded-2xl border border-dashed border-line-strong bg-card/70 p-4',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <MysteryAvatar size={48} />
        <div>
          <h3 className="font-display text-xl text-ink-2">{t.figures.undiscovered}</h3>
          {hint && <p className="text-sm text-ink-3">{hint}</p>}
        </div>
      </div>
      <p className="mt-3 text-sm text-ink-3">
        {meta.school} · {meta.tags.slice(0, 2).join(', ')}
      </p>
      <div className="mt-auto pt-4">
        <button
          type="button"
          onClick={() => {
            if (discover(meta.id)) toast(t.figures.newlyDiscovered(meta.name), 'ok');
            navigate(`/denkers/${meta.id}`);
          }}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line-strong bg-card px-3.5 text-sm font-medium text-ink hover:bg-paper-2"
        >
          <Sparkle aria-hidden className="size-4 text-gold" />
          {t.figures.reveal}
        </button>
      </div>
    </article>
  );
}
