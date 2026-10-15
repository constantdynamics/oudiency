import type { ReactNode } from 'react';
import { cx } from '@/lib/cx';
import { figureThemeStyle, type ThemedFigure, useFigureFonts } from './theme';

interface ThemeFrameProps {
  figure: ThemedFigure;
  /** Toon het achtergrondmotief van de denker. */
  motif?: boolean;
  className?: string;
  children: ReactNode;
  as?: 'div' | 'section' | 'article' | 'header' | 'li';
}

export function ThemeFrame({
  figure,
  motif = false,
  className,
  children,
  as: Tag = 'div',
}: ThemeFrameProps) {
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
