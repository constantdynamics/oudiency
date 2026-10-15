import { type CSSProperties, useEffect } from 'react';
import type { Figure } from '@/data/types';
import { DISPLAY_FONT_FAMILY, loadDisplayFont, loadNativeFont, NATIVE_FONT_FAMILY } from '@/lib/fonts';

export type ThemedFigure = Pick<Figure, 'id' | 'theme' | 'nativeScript'>;

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

