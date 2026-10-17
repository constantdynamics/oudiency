import { Quote } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/Button';
import type { FigureMeta } from '@/data/figures';
import { highlightProblem, suggestHighlight } from '@/lib/quoteCard';
import { QuoteCardDialog } from './QuoteCardDialog';

/**
 * "Deel een highlight": selecteer eerst een passage in de tekst (of laat de app er een
 * voorstellen) en maak er een citaatkaart van.
 */
export function ShareHighlightButton({
  figure,
  source,
  sourceLabel,
  label,
}: {
  figure: FigureMeta;
  /** Platte tekst van het gesprek of college. */
  source: string;
  sourceLabel: string;
  label: string;
}) {
  const [initial, setInitial] = useState<string>();
  const open = () => {
    const selected = window.getSelection?.()?.toString().trim() ?? '';
    setInitial(
      selected && !highlightProblem(selected, source) ? selected : suggestHighlight(source),
    );
  };
  return (
    <>
      <Button
        variant="secondary"
        icon={<Quote aria-hidden className="size-4" />}
        // De selectie in de tekst blijft staan als je op de knop drukt.
        onMouseDown={(event) => event.preventDefault()}
        onClick={open}
      >
        {label}
      </Button>
      {initial !== undefined && (
        <QuoteCardDialog
          open
          onClose={() => setInitial(undefined)}
          figure={figure}
          source={source}
          initial={initial}
          sourceLabel={sourceLabel}
        />
      )}
    </>
  );
}
