import { Search, Sparkles, UserRound } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { AiLabel } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { CrisisCard } from '@/components/CrisisCard';
import { TextArea } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { Thinking } from '@/components/Thinking';
import { toast } from '@/components/toastStore';
import { LIMITS } from '@/config/limits';
import { PODCAST } from '@/config/podcast';
import { RESEARCH, type ResearchForm } from '@/config/research';
import { CORE_IDS, findMeta } from '@/data/figures';
import { useDiscovered } from '@/features/figures/discovery';
import { FigureChooser } from '@/features/figures/FigureChooser';
import { usePodcastKeys } from '@/features/podcasts/usePodcastKeys';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { tr } from '@/i18n/research';
import { clock } from '@/lib/clock';
import { cx } from '@/lib/cx';
import { localDateKey } from '@/lib/dates';
import { formatEur } from '@/podcast/costs';
import { costLines, totalEur } from '@/research/estimate';
import { startResearch } from '@/research/researchState';
import type { HelperSuggestion } from '@/services/discover.service';
import { LimitError, remainingOn } from '@/services/limits.service';
import {
  draftRequest,
  initialDraft,
  newResearch,
  type ResearchProblem,
  researchProblem,
} from '@/services/research.service';
import { usePodcastStore } from '@/store/podcastStore';
import { useProfileStore } from '@/store/profileStore';
import { useResearchStore } from '@/store/researchStore';
import { CostSummary, FormOptions } from './FormOptions';
import { BackToResearch, KeyNotice } from './researchParts';

/** De vormen die je bij een nieuw onderzoek kunt kiezen. */
const AVAILABLE_FORMS: readonly ResearchForm[] = ['tekst'];

type SuggestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'done'; suggestions: HelperSuggestion[] };

/** "Stel denkers voor" (keuze 5b): drie denkers bij de vraag, die je kunt aan- of uitzetten. */
function Suggestions({
  question,
  value,
  onChange,
}: {
  question: string;
  value: string[];
  onChange: (ids: string[]) => void;
}) {
  const [state, setState] = useState<SuggestState>({ status: 'idle' });
  const full = value.length >= RESEARCH.maxFigures;

  const suggest = async () => {
    setState({ status: 'loading' });
    try {
      const { findHelpers } = await import('@/services/helperAi');
      const suggestions = await findHelpers(question.trim());
      // Wie voorgesteld wordt, ontdek je (en kun je dus kiezen).
      const profile = useProfileStore.getState();
      for (const s of suggestions) if (!CORE_IDS.includes(s.figureId)) profile.discover(s.figureId);
      setState({ status: 'done', suggestions });
    } catch (error) {
      console.warn('[onderzoek] denkers voorstellen mislukt', error);
      setState({ status: 'error' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="secondary"
          disabled={
            question.trim().length < RESEARCH.questionMinLength || state.status === 'loading'
          }
          icon={<Sparkles aria-hidden className="size-4 text-gold" />}
          onClick={() => void suggest()}
        >
          {tr.form.suggest}
        </Button>
        {state.status === 'loading' && <Thinking text={tr.form.suggesting} />}
        {state.status === 'error' && (
          <p role="alert" className="text-danger">
            {tr.form.suggestError}
          </p>
        )}
      </div>
      {state.status === 'done' && state.suggestions.length > 0 && (
        <div aria-live="polite">
          <p className="mb-2 flex flex-wrap items-center gap-2 font-medium">
            {tr.form.suggestions}
            <AiLabel />
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {state.suggestions.map((suggestion) => {
              const meta = findMeta(suggestion.figureId);
              if (!meta) return null;
              const selected = value.includes(meta.id);
              const blocked = full && !selected;
              return (
                <li key={meta.id}>
                  <button
                    type="button"
                    aria-pressed={selected}
                    aria-disabled={blocked || undefined}
                    aria-label={
                      selected
                        ? tr.form.removeSuggestion(meta.name)
                        : tr.form.addSuggestion(meta.name)
                    }
                    onClick={() => {
                      if (selected) onChange(value.filter((id) => id !== meta.id));
                      else if (!blocked) onChange([...value, meta.id]);
                    }}
                    className={cx(
                      'flex h-full w-full flex-col gap-2 rounded-xl border p-3 text-left transition-colors',
                      selected ? 'border-ink bg-paper-2' : 'border-line bg-card hover:bg-paper-2',
                      blocked && 'opacity-50',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <Avatar figure={meta} size={36} />
                      <span className="font-medium">{meta.name}</span>
                    </span>
                    <span className="text-sm text-ink-2">{suggestion.why}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Een onderwerp laten uitzoeken: vraag, denkers, vorm, kosten en bevestigen (keuze 8c). */
export function NewResearchPage() {
  useDocumentTitle(tr.form.title);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const known = useDiscovered();
  const keys = usePodcastKeys();
  const now = useNow(60_000);
  const profile = useProfileStore((s) => s.profile);
  const ttsModel = usePodcastStore((s) => s.settings.ttsModel) ?? PODCAST.defaultTtsModel;
  const confirmRef = useRef<HTMLHeadingElement>(null);
  const formId = useId();

  const [question, setQuestion] = useState(() =>
    (params.get('vraag') ?? '').slice(0, RESEARCH.questionMaxLength),
  );
  const [figureIds, setFigureIds] = useState<string[]>(() =>
    [...new Set((params.get('denkers') ?? '').split(','))]
      .filter((id) => id && findMeta(id))
      .slice(0, RESEARCH.maxFigures),
  );
  const [draft, setDraft] = useState(() => initialDraft());
  const [problem, setProblem] = useState<ResearchProblem>();
  const [confirming, setConfirming] = useState(false);

  const today = localDateKey(now);
  const remaining = remainingOn(profile.usageByDate, profile.tier, 'research', today);
  const chosen = figureIds.filter((id) => known.has(id));
  const request = { question, figureIds: chosen, first: draftRequest(draft, chosen) };
  const lines = costLines(request.first, ttsModel, true);

  useEffect(() => {
    if (confirming) confirmRef.current?.focus();
  }, [confirming]);

  const change = (apply: () => void) => {
    apply();
    setProblem(undefined);
    setConfirming(false);
  };

  const review = () => {
    const found = researchProblem(request, {
      hasClaudeKey: keys.claude,
      hasVoiceKey: keys.elevenLabs,
      known,
      remainingToday: remaining,
    });
    setProblem(found);
    setConfirming(!found);
  };

  const start = () => {
    const at = clock.now();
    try {
      useProfileStore.getState().consumeUsage('research', localDateKey(at));
    } catch (error) {
      if (error instanceof LimitError) {
        setProblem('limiet');
        setConfirming(false);
        return;
      }
      throw error;
    }
    const research = newResearch(request, at);
    useResearchStore.getState().add(research);
    startResearch(research.id);
    toast(tr.form.started, 'ok');
    navigate(`/onderzoek/${research.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <BackToResearch />
      <PageHeader title={tr.form.title} intro={tr.form.intro} />
      {!keys.claude && <KeyNotice />}
      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          review();
        }}
      >
        <TextArea
          label={tr.form.question}
          hint={tr.form.questionHint}
          placeholder={tr.form.questionPlaceholder}
          rows={3}
          maxLength={RESEARCH.questionMaxLength}
          counter
          value={question}
          onChange={(event) => change(() => setQuestion(event.target.value))}
        />

        <section aria-labelledby={`${formId}-denkers`} className="space-y-4">
          <h2 id={`${formId}-denkers`} className="flex items-center gap-2 text-2xl">
            <UserRound aria-hidden className="size-5 text-gold" />
            {tr.form.figures}
          </h2>
          <Suggestions
            question={question}
            value={chosen}
            onChange={(ids) => change(() => setFigureIds(ids))}
          />
          <FigureChooser
            max={RESEARCH.maxFigures}
            value={chosen}
            onChange={(ids) => change(() => setFigureIds(ids))}
            labels={{
              legend: tr.form.chooseYourself,
              hint: tr.form.figuresHint,
              search: tr.form.search,
              chosen: tr.form.chosen,
              unpick: tr.form.unpick,
              full: tr.form.full,
              noMatch: tr.form.noMatch,
              showAll: tr.form.showAll,
            }}
          />
        </section>

        <section aria-labelledby={`${formId}-vorm`} className="space-y-4">
          <h2 id={`${formId}-vorm`} className="text-2xl">
            {tr.form.formTitle}
          </h2>
          <FormOptions
            figureIds={chosen}
            draft={draft}
            onChange={(next) => change(() => setDraft(next))}
            forms={AVAILABLE_FORMS}
            hasVoiceKey={keys.elevenLabs}
          />
        </section>

        <div className="space-y-3">
          <CostSummary lines={lines} />
          <p className="text-sm text-ink-3">
            {tr.library.today(remaining, LIMITS.research.perDay[profile.tier])}
          </p>
        </div>

        {problem && (
          <div className="space-y-3">
            <p role="alert" className="text-danger">
              {tr.problems[problem]}
            </p>
            {problem === 'crisis' && <CrisisCard />}
          </div>
        )}

        {confirming ? (
          <Card as="section" aria-labelledby={`${formId}-bevestig`} className="border-ink">
            <h2
              id={`${formId}-bevestig`}
              ref={confirmRef}
              tabIndex={-1}
              className="text-2xl focus:outline-none"
            >
              {tr.form.confirmTitle}
            </h2>
            <p className="mt-2 text-ink-2">{tr.form.confirm(formatEur(totalEur(lines)))}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                type="button"
                size="lg"
                icon={<Search aria-hidden className="size-4" />}
                onClick={start}
              >
                {tr.form.start}
              </Button>
              <Button type="button" variant="ghost" size="lg" onClick={() => setConfirming(false)}>
                {tr.form.back}
              </Button>
            </div>
          </Card>
        ) : (
          <Button type="submit" size="lg" disabled={!keys.claude}>
            {tr.form.review}
          </Button>
        )}
      </form>
    </div>
  );
}
