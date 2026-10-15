import { type CSSProperties, type ReactNode, useEffect } from 'react';
import type { Figure } from '@/data/types';
import { cx } from '@/lib/cx';
import { DISPLAY_FONT_FAMILY, loadDisplayFont, loadNativeFont, NATIVE_FONT_FAMILY } from '@/lib/fonts';

type ThemedFigure = Pick<Figure, 'id' | 'theme' | 'nativeScript'>;

/** CSS-variabelen van een denker (thema's via custom properties, nooit dynamische classnames). */
export function figureThemeStyle(figure: ThemedFigure): CSSProperties {
  return {
    '--fig-primary': figure.theme.primary,
    '--fig-secondary': figure.theme.secondary,
    '--fig-accent': figure.theme.accent,
    '--fig-surface': figure.theme.surface,
    '--fig-font': DISPLAY_FONT_FAMILY[figure.theme.displayFont],
    '--fig-native-font': NATIVE_FONT_FAMILY[figure.nativeScript ?? 'latin'],
  } as CSSProperties;
}

export function useFigureFonts(figure: ThemedFigure | undefined) {
  const displayFont = figure?.theme.displayFont;
  const script = figure?.nativeScript;
  useEffect(() => {
    if (displayFont) loadDisplayFont(displayFont);
    if (script) loadNativeFont(script);
  }, [displayFont, script]);
}

interface ThemeFrameProps {
  figure: ThemedFigure;
  /** Toon het achtergrondmotief van de denker. */
  motif?: boolean;
  className?: string;
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'header' | 'li';
}

export function ThemeFrame({ figure, motif = false, className, children, as: Tag = 'div' }: ThemeFrameProps) {
  useFigureFonts(figure);
  return (
    <Tag
      data-figure={figure.id}
      data-motif={motif ? figure.theme.motif : undefined}
      className={cx(motif && 'motif-bg', className)}
      style={figureThemeStyle(figure)}
    >
      {children}
    </Tag>
  );
}
