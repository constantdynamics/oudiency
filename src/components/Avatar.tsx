import type { ReactNode } from 'react';
import type { Figure, MotifId } from '@/data/types';
import { cx } from '@/lib/cx';
import { DISPLAY_FONT_FAMILY, NATIVE_FONT_FAMILY } from '@/lib/fonts';
import { monogramFor } from '@/lib/monogram';
import { figureThemeStyle, useFigureFonts } from './theme';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking';

type AvatarFigure = Pick<Figure, 'id' | 'name' | 'theme' | 'nativeScript'> & { monogram?: string };


/** Motieftekening per thema (lijnwerk in een 100×100-vlak, achter het monogram). */
function MotifGlyph({ motif }: { motif: MotifId }): ReactNode {
  const common = 'fill-none stroke-fig';
  switch (motif) {
    case 'meander':
      return (
        <g className={common} strokeWidth={2} opacity={0.5}>
          <path d="M14 74h10v-8h-6v-6h14v14h10v-14h14v6h-6v8h10v-14h14v14h8" />
          <path d="M30 26c6-6 14-8 20-8s14 2 20 8" strokeWidth={1.2} />
          <ellipse cx="34" cy="24" rx="4" ry="1.8" transform="rotate(-30 34 24)" className="fill-fig stroke-none" />
          <ellipse cx="66" cy="24" rx="4" ry="1.8" transform="rotate(30 66 24)" className="fill-fig stroke-none" />
        </g>
      );
    case 'laurel':
      return (
        <g className="fill-fig-accent" opacity={0.75}>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse
              key={`l${i}`}
              cx={22 + i * 1.2}
              cy={70 - i * 8}
              rx="5.5"
              ry="2.2"
              transform={`rotate(${-60 + i * 12} ${22 + i * 1.2} ${70 - i * 8})`}
            />
          ))}
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse
              key={`r${i}`}
              cx={78 - i * 1.2}
              cy={70 - i * 8}
              rx="5.5"
              ry="2.2"
              transform={`rotate(${60 - i * 12} ${78 - i * 1.2} ${70 - i * 8})`}
            />
          ))}
        </g>
      );
    case 'inkwash':
      return (
        <g className="fill-none stroke-fig" strokeLinecap="round" opacity={0.55}>
          <path d="M44 16a34 34 0 1 0 28 10" strokeWidth={4.5} />
          <path d="M28 80c8-3 16-3 24 0" strokeWidth={1.4} />
        </g>
      );
    case 'stars':
      return (
        <g className="fill-fig-accent" opacity={0.85}>
          <path d="M26 24l1.6 4.4 4.4 1.6-4.4 1.6-1.6 4.4-1.6-4.4-4.4-1.6 4.4-1.6z" />
          <path d="M74 20l1.2 3.2 3.2 1.2-3.2 1.2-1.2 3.2-1.2-3.2-3.2-1.2 3.2-1.2z" />
          <circle cx="80" cy="44" r="1.3" />
          <circle cx="20" cy="50" r="1.1" />
          <circle cx="68" cy="78" r="1.4" />
          <path d="M30 76l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" />
        </g>
      );
    case 'kite':
      return (
        <g className="fill-none stroke-fig" strokeWidth={1.6} opacity={0.5}>
          <path d="M76 14l8 10-8 14-8-14z" />
          <path d="M76 38c2 6-2 10 0 16" />
          <path d="M22 18l-6 12h7l-5 13" className="stroke-fig-accent" strokeWidth={2.2} />
        </g>
      );
    case 'charkha':
      return (
        <g className="fill-none stroke-fig" strokeWidth={1.4} opacity={0.4}>
          <circle cx="50" cy="50" r="32" />
          <circle cx="50" cy="50" r="3" className="fill-fig" />
          {[0, 30, 60, 90, 120, 150].map((angle) => (
            <path key={angle} d="M50 18v64" transform={`rotate(${angle} 50 50)`} />
          ))}
        </g>
      );
    case 'lens':
      return (
        <g className="fill-none stroke-fig" opacity={0.45}>
          <ellipse cx="50" cy="50" rx="30" ry="30" strokeWidth={1.4} />
          <ellipse cx="50" cy="50" rx="14" ry="30" strokeWidth={1} />
          <path d="M14 30l22 14M12 50h24M14 70l22-14" strokeWidth={1} className="stroke-fig-accent" />
        </g>
      );
    case 'botanical':
      return (
        <g className="stroke-fig" strokeWidth={1.3} opacity={0.5}>
          <path d="M22 84C30 70 32 56 30 40" className="fill-none" />
          <path d="M30 48c7-2 11-7 11-14-7 1-11 6-11 14zM29 60c-7-1-11-6-12-13 7 0 11 5 12 13zM27 72c7-2 11-7 12-14-7 1-11 6-12 14z" className="fill-fig" fillOpacity={0.5} />
          <path d="M78 84C70 70 68 56 70 40" className="fill-none" />
          <path d="M70 48c-7-2-11-7-11-14 7 1 11 6 11 14zM71 60c7-1 11-6 12-13-7 0-11 5-12 13z" className="fill-fig" fillOpacity={0.5} />
        </g>
      );
    case 'column':
      return (
        <g className="fill-none stroke-fig" strokeWidth={1.4} opacity={0.4}>
          <path d="M16 22h12M16 78h12M19 24v52M22 24v52M25 24v52" />
          <path d="M72 22h12M72 78h12M75 24v52M78 24v52M81 24v52" />
        </g>
      );
    case 'scroll':
      return (
        <g className="fill-none stroke-fig" strokeWidth={1.5} opacity={0.45}>
          <path d="M18 78c10-8 20-8 32 0s22 8 32 0" />
          <path d="M18 22c10 8 20 8 32 0s22-8 32 0" />
        </g>
      );
    case 'quill':
      return (
        <g className="fill-none stroke-fig" strokeWidth={1.4} opacity={0.5}>
          <path d="M70 84c4-20 10-40 18-62-14 10-22 30-24 52z" />
          <path d="M70 84l10-40" />
        </g>
      );
    case 'compass':
      return (
        <g className="fill-fig-accent" opacity={0.6}>
          <path d="M50 10l3.5 36.5L50 50l-3.5-3.5z" />
          <path d="M50 90l-3.5-36.5L50 50l3.5 3.5z" />
          <path d="M10 50l36.5-3.5L50 50l-3.5 3.5z" opacity={0.6} />
          <path d="M90 50l-36.5 3.5L50 50l3.5-3.5z" opacity={0.6} />
        </g>
      );
    case 'lotus':
      return (
        <g className="fill-none stroke-fig" strokeWidth={1.4} opacity={0.5}>
          <path d="M50 86c-10-4-16-10-16-18 8 2 13 8 16 18zM50 86c10-4 16-10 16-18-8 2-13 8-16 18zM50 86c-4-8-4-16 0-24 4 8 4 16 0 24z" />
        </g>
      );
    case 'wave':
      return (
        <g className="fill-none stroke-fig" strokeWidth={1.5} opacity={0.45}>
          <path d="M14 74c6-6 12-6 18 0s12 6 18 0 12-6 18 0 12 6 18 0" />
          <path d="M18 82c6-5 12-5 18 0s12 5 18 0 12-5 18 0 10 5 14 0" strokeWidth={1} />
        </g>
      );
    case 'tulip':
      return (
        <g className="fill-none stroke-fig" strokeWidth={1.4} opacity={0.5}>
          <path d="M50 88V70M43 66c0 6 3 8 7 8s7-2 7-8l-3.5 3-3.5-5-3.5 5z" />
          <path d="M50 84c-5-1-8-4-8-7M50 84c5-1 8-4 8-7" />
        </g>
      );
    case 'flame':
      return (
        <g className="fill-none stroke-fig-accent" strokeWidth={1.6} opacity={0.6}>
          <path d="M50 88c-8 0-12-6-9-13 2-6 7-8 7-15 6 5 11 10 11 18 0 6-4 10-9 10z" />
        </g>
      );
  }
}

interface AvatarProps {
  figure: AvatarFigure;
  size?: number;
  state?: AvatarState;
  className?: string;
  /** Verberg voor schermlezers (als de naam al naast de avatar staat). */
  decorative?: boolean;
}

/**
 * Origineel ontworpen SVG-medaillon: monogram plus motief in het thema van de denker.
 * Animaties per staat (luistert / denkt / spreekt); respecteert prefers-reduced-motion.
 * Nooit foto's van echte, hedendaagse mensen.
 */
export function Avatar({ figure, size = 56, state = 'idle', className, decorative = true }: AvatarProps) {
  useFigureFonts(figure);
  const monogram = monogramFor(figure);
  const isNative = [...monogram].some((ch) => (ch.codePointAt(0) ?? 0) > 0x24f);
  const fontFamily = isNative
    ? NATIVE_FONT_FAMILY[figure.nativeScript ?? 'latin']
    : DISPLAY_FONT_FAMILY[figure.theme.displayFont];
  const fontSize = monogram.length >= 3 ? 24 : monogram.length === 2 ? 30 : 40;

  return (
    <span
      className={cx('relative inline-flex shrink-0', className)}
      style={{ ...figureThemeStyle(figure), width: size, height: size }}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : figure.name}
      aria-hidden={decorative ? true : undefined}
    >
      {state === 'speaking' && (
        <>
          <span className="absolute inset-0 rounded-full border-2 border-fig-accent animate-ripple motion-reduce:hidden" />
          <span className="absolute inset-0 rounded-full border border-fig animate-ripple [animation-delay:0.6s] motion-reduce:hidden" />
        </>
      )}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className={cx('relative', state === 'listening' && 'animate-breathe motion-reduce:animate-none')}
      >
        <circle cx="50" cy="50" r="48" className="fill-fig-accent" opacity={0.9} />
        <circle cx="50" cy="50" r="45.5" className="fill-fig-surface" />
        <circle cx="50" cy="50" r="43" className="fill-none stroke-fig" strokeWidth={0.8} opacity={0.6} />
        <MotifGlyph motif={figure.theme.motif} />
        <text
          x="50"
          y="50"
          dy="0.35em"
          textAnchor="middle"
          className="fill-fig"
          style={{ fontFamily, fontSize, fontWeight: 600, letterSpacing: monogram.length > 1 ? '0.02em' : undefined }}
        >
          {monogram}
        </text>
        {state === 'thinking' && (
          <circle
            cx="50"
            cy="50"
            r="48"
            className="fill-none stroke-fig origin-center animate-spin-slow motion-reduce:animate-none"
            strokeWidth={2.4}
            strokeDasharray="4 9"
            strokeLinecap="round"
          />
        )}
      </svg>
    </span>
  );
}
