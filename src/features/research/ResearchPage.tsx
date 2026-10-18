import { Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { AiLabel } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Dialog } from '@/components/Dialog';
import { EmptyState } from '@/components/EmptyState';
import { Thinking } from '@/components/Thinking';
import { toast } from '@/components/toastStore';
import { PODCAST } from '@/config/podcast';
import { RESEARCH_FORMS } from '@/config/research';
import { loadFigures } from '@/data/figures';
import type { Figure } from '@/data/types';
import { usePodcastKeys } from '@/features/podcasts/usePodcastKeys';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tr } from '@/i18n/research';
import { clock } from '@/lib/clock';
import { costLines } from '@/research/estimate';
import { startOutput, startResearch, useActiveWork } from '@/research/researchState';
import {
  draftRequest,
  formProblem,
  initialDraft,
  newOutput,
  type ResearchProblem,
} from '@/services/research.service';
import { usePodcastStore } from '@/store/podcastStore';
import type { Research } from '@/store/researchSchemas';
import { useResearchStore } from '@/store/researchStore';
import { CostSummary, FormOptions } from './FormOptions';
import { figureNames, phaseOf } from './format';
import { OutputView } from './outputParts';
import { BackToResearch, FigureRow } from './researchParts';

/** De volledige profielen van de denkers (voor het thema en de leestips). */
function useFigures(ids: readonly string[]): Figure[] {
  const key = ids.join(',');
  const [figures, setFigures] = useState<Figure[]>([]);
  useEffect(() => {
    let alive = true;
    loadFigures(key ? key.split(',') : []).then(
      (loaded) => {
        if (alive) setFigures(loaded);
      },
      () => {},
    );
    return () => {
      alive = false;
    };
  }, [key]);
  return figures;
}

/** "Maak er nog iets van" (keuze 6a): een extra vorm uit hetzelfde onderzoek. */
function MakeMore({ research }: { research: Research }) {
  const titleId = useId();
  const keys = usePodcastKeys();
  const ttsModel = usePodcastStore((s) => s.settings.ttsModel) ?? PODCAST.defaultTtsModel;
  const [draft, setDraft] = useState(() => initialDraft());
  const [problem, setProblem] = useState<ResearchProblem>();
  const request = draftRequest(draft, research.figureIds);

  const make = () => {
    const found = keys.claude
      ? formProblem(request, research.figureIds, { elevenLabs: keys.elevenLabs })
      : 'sleutel';
    setProblem(found);
    if (found) return;
    const output = newOutput(request, clock.iso());
    useResearchStore.getState().addOutput(research.id, output);
    if (output.status !== 'klaar') startOutput(research.id, output.id);
    toast(tr.page.made, 'ok');
  };

  return (
    <Card as="section" aria-labelledby={titleId}>
      <h2 id={titleId} className="flex items-center gap-2 text-2xl">
        <Plus aria-hidden className="size-5 text-gold" />
        {tr.page.makeMore}
      </h2>
      <p className="mt-1 mb-4 text-ink-2">{tr.page.makeMoreHint}</p>
      <div className="space-y-4">
        <FormOptions
          figureIds={research.figureIds}
          draft={draft}
          onChange={(next) => {
            setDraft(next);
            setProblem(undefined);
          }}
          forms={RESEARCH_FORMS}
          hasVoiceKey={keys.elevenLabs}
        />
        <CostSummary lines={costLines(request, ttsModel, false)} />
        {problem && (
          <p role="alert" className="text-danger">
            {tr.problems[problem]}
          </p>
        )}
        <Button onClick={make} disabled={!keys.claude}>
          {tr.page.make}
        </Button>
      </div>
    </Card>
  );
}

function RemoveResearch({ research }: { research: Research }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="ghost"
        icon={<Trash2 aria-hidden className="size-4" />}
        onClick={() => setOpen(true)}
      >
        {tr.page.remove}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={tr.page.remove}
        description={tr.page.removeConfirm}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {tr.page.keep}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                useResearchStore.getState().remove(research.id);
                toast(tr.page.removed, 'ok');
                navigate('/onderzoek');
              }}
            >
              {tr.page.removeYes}
            </Button>
          </>
        }
      >
        {null}
      </Dialog>
    </>
  );
}

/** Eén onderzoek: de vraag, de denkers en wat ervan gemaakt is (de notitie zelf blijft verborgen). */
export function ResearchPage() {
  const { id } = useParams();
  const research = useResearchStore((s) => s.researches.find((r) => r.id === id));
  useActiveWork();
  const figures = useFigures(research?.figureIds ?? []);
  useDocumentTitle(research?.title ?? research?.question ?? tr.library.title);

  if (!research) {
    return (
      <div className="mx-auto max-w-3xl">
        <BackToResearch />
        <EmptyState title={tr.page.notFound} />
      </div>
    );
  }

  const phase = phaseOf(research);
  const title = research.title ?? research.question;
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <BackToResearch />
        <header>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h1 className="text-4xl sm:text-5xl">{title}</h1>
            <AiLabel />
          </div>
          {research.title && (
            <p className="mt-2 text-lg text-ink-2">
              <span className="sr-only">{tr.page.question}: </span>
              {research.question}
            </p>
          )}
          <p className="mt-3 flex items-center gap-3 text-ink-2">
            <FigureRow ids={research.figureIds} />
            <span>
              {tr.page.with} {figureNames(research.figureIds)}
            </span>
          </p>
        </header>
      </div>

      {phase === 'zoeken' && (
        <Card>
          <Thinking text={tr.page.working} />
          <p className="mt-2 text-ink-2">{tr.page.workingHint}</p>
        </Card>
      )}
      {(phase === 'onderbroken' || phase === 'fout') && (
        <Card className="space-y-3">
          <p role="alert" className="text-danger">
            {phase === 'onderbroken' ? tr.page.interrupted : (research.error ?? tr.failed)}
          </p>
          {!research.refused && (
            <>
              <Button
                variant="secondary"
                icon={<RotateCcw aria-hidden className="size-4" />}
                onClick={() => startResearch(research.id)}
              >
                {tr.page.retry}
              </Button>
              <p className="text-sm text-ink-3">{tr.page.retryHint}</p>
            </>
          )}
        </Card>
      )}

      {research.status === 'klaar' && (
        <>
          <section aria-labelledby="gemaakt" className="space-y-4">
            <h2 id="gemaakt" className="text-2xl sm:text-3xl">
              {tr.page.results}
            </h2>
            {research.outputs.map((output) => (
              <OutputView key={output.id} research={research} output={output} figures={figures} />
            ))}
          </section>
          <MakeMore research={research} />
        </>
      )}

      <div className="border-t border-line pt-4">
        <RemoveResearch research={research} />
      </div>
    </div>
  );
}
