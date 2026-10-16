import { Copy, Download, Share2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Dialog } from '@/components/Dialog';
import { TextArea } from '@/components/Field';
import { Thinking } from '@/components/Thinking';
import { toast } from '@/components/toastStore';
import { LIMITS } from '@/config/limits';
import type { FigureMeta } from '@/data/figures';
import { t } from '@/i18n/nl';
import { collapse, highlightProblem } from '@/lib/quoteCard';
import { renderQuoteCard } from './renderQuoteCard';

/** Deel een fragment als citaatkaart: kies (of kort in), bekijk, en deel of download. */
export function QuoteCardDialog({
  open,
  onClose,
  figure,
  source,
  initial,
  sourceLabel,
}: {
  open: boolean;
  onClose: () => void;
  figure: FigureMeta;
  /** De platte tekst waar het fragment letterlijk uit moet komen. */
  source: string;
  initial: string;
  sourceLabel: string;
}) {
  const [passage, setPassage] = useState(initial);
  const [card, setCard] = useState<{
    file: File;
    url: string;
    passage: string;
    canShare: boolean;
  }>();
  const [failed, setFailed] = useState(false);
  const problem = highlightProblem(passage, source);
  const clean = collapse(passage);
  const name = figure.shortName ?? figure.name;
  const text = `“${clean}”\n— ${name} (${t.share.label})`;

  // De kaart opnieuw tekenen als het fragment klopt (kort uitgesteld tijdens het typen).
  useEffect(() => {
    if (!open || problem) return;
    let active = true;
    let url: string | undefined;
    const timer = setTimeout(() => {
      renderQuoteCard({ passage: clean, figure, sourceLabel }).then(
        (blob) => {
          if (!active) return;
          url = URL.createObjectURL(blob);
          const file = new File([blob], `oudiency-${figure.id}.png`, { type: 'image/png' });
          const canShare = Boolean(navigator.canShare?.({ files: [file] }));
          setCard({ file, url, passage: clean, canShare });
          setFailed(false);
        },
        (error: unknown) => {
          console.warn('[delen] kaart tekenen mislukt', error);
          if (active) setFailed(true);
        },
      );
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
    };
  }, [open, problem, clean, figure, sourceLabel]);

  const ready = card && card.passage === clean && !problem;
  const file = ready ? card.file : undefined;
  const canShareFile = Boolean(ready && card.canShare);

  const share = async () => {
    if (!file) return;
    try {
      await navigator.share({ files: [file], text, title: t.share.title });
      toast(t.share.shared, 'ok');
    } catch {
      // geannuleerd of niet toegestaan: niets aan de hand
    }
  };

  const download = () => {
    if (!ready) return;
    const link = document.createElement('a');
    link.href = card.url;
    link.download = `oudiency-${figure.id}.png`;
    link.click();
    toast(t.share.downloaded, 'ok');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast(t.share.copied, 'ok');
    } catch {
      toast(t.errors.generic, 'warn');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t.share.title}
      description={t.share.disclaimer}
      footer={
        <>
          <Button
            variant="secondary"
            icon={<Copy aria-hidden className="size-4" />}
            onClick={copy}
            disabled={Boolean(problem)}
          >
            {t.share.copyText}
          </Button>
          <Button
            variant="secondary"
            icon={<Download aria-hidden className="size-4" />}
            onClick={download}
            disabled={!ready}
          >
            {t.share.download}
          </Button>
          {canShareFile && (
            <Button icon={<Share2 aria-hidden className="size-4" />} onClick={share}>
              {t.share.share}
            </Button>
          )}
        </>
      }
    >
      <TextArea
        label={t.share.passage}
        hint={t.share.selectHint}
        maxLength={LIMITS.share.highlightMaxLength}
        counter
        rows={3}
        value={passage}
        onChange={(event) => setPassage(event.target.value)}
      />
      {problem && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {problem}
        </p>
      )}
      <div className="mt-4">
        {ready ? (
          <img
            src={card.url}
            alt={`${t.share.preview}: “${clean}” — ${figure.name}`}
            className="mx-auto max-h-[50vh] w-auto rounded-xl border border-line shadow-card"
          />
        ) : failed ? (
          <p className="text-sm text-ink-3">{t.errors.generic}</p>
        ) : (
          !problem && <Thinking text={t.share.rendering} />
        )}
      </div>
    </Dialog>
  );
}
