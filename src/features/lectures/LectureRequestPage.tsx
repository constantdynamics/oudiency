import { Lightbulb, Play } from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { activeProviderId } from '@/ai';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { TextArea, TextField } from '@/components/Field';
import { PageHeader } from '@/components/PageHeader';
import { ThemeFrame } from '@/components/ThemeFrame';
import { toast } from '@/components/toastStore';
import { LIMITS } from '@/config/limits';
import { findMeta, type FigureMeta, useFigure } from '@/data/figures';
import type { Figure } from '@/data/types';
import { FigurePicker } from '@/features/figures/FigurePicker';
import { useDiscovered } from '@/features/figures/discovery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { capitalize } from '@/lib/text';
import { localDateKey } from '@/lib/dates';
import { LectureRequestError, requestLecture, requestProblem } from '@/services/lecture.service';
import { dailyLimit, LimitError, remainingOn } from '@/services/limits.service';
import { useProfileStore } from '@/store/profileStore';
import { runNext } from './liveLecture';

function RequestForm({ meta, figure }: { meta: FigureMeta; figure?: Figure }) {
  const navigate = useNavigate();
  const now = useNow(60_000);
  const profile = useProfileStore((s) => s.profile);
  const [topic, setTopic] = useState('');
  const [mainQuestion, setMainQuestion] = useState('');
  const [error, setError] = useState<string>();
  const { topicMaxLength, mainQuestionMaxLength } = LIMITS.lecture;
  const today = localDateKey(now);
  const limit = dailyLimit('lectures', profile.tier);
  const left = remainingOn(profile.usageByDate, profile.tier, 'lectures', today);
  const name = meta.shortName ?? meta.name;
  const ideas = (figure?.helpsWith ?? []).slice(0, 6);

  const submit = () => {
    const problem = requestProblem({ topic, mainQuestion });
    if (problem) {
      setError(problem);
      return;
    }
    try {
      const lecture = requestLecture(
        { figureId: meta.id, topic, mainQuestion },
        activeProviderId(),
      );
      // Het plan en de opening beginnen meteen; de collegepagina toont de voortgang.
      if (figure) void runNext(lecture.id, figure, profile.displayName);
      navigate(`/colleges/${lecture.id}`);
    } catch (problem) {
      if (problem instanceof LimitError || problem instanceof LectureRequestError) {
        setError(problem.message);
      } else {
        toast(t.errors.generic, 'warn');
      }
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        eyebrow={t.lectures.requestTitle}
        title={
          <span className="flex items-center gap-3">
            <Avatar figure={meta} size={56} decorative={false} />
            <span className="font-fig text-fig">{meta.name}</span>
          </span>
        }
        intro={t.lectures.requestIntro(name)}
      />
      <p className="mb-5 text-ink-2">
        {t.lectures.today(limit - left, limit)}
        {' · '}
        <Link to="/colleges/aanvragen" className="underline underline-offset-2">
          {t.lectures.otherTeacher}
        </Link>
      </p>

      {left === 0 ? (
        <div role="status" className="rounded-2xl border border-warn-soft bg-warn-soft p-4">
          <p className="font-semibold">{t.lectures.limitReached}</p>
          {profile.tier === 'basis' && <p className="mt-1 text-ink-2">{t.lectures.premiumHint}</p>}
        </div>
      ) : (
        <form
          className="space-y-5"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <TextField
            label={t.lectures.topic}
            hint={t.lectures.topicHint}
            placeholder={t.lectures.topicPlaceholder}
            maxLength={topicMaxLength}
            counter
            value={topic}
            onChange={(event) => {
              setTopic(event.target.value);
              setError(undefined);
            }}
          />
          {ideas.length > 0 && (
            <div>
              <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-ink-2">
                <Lightbulb aria-hidden className="size-4 text-gold" />
                {t.lectures.ideas}
              </p>
              <ul className="flex flex-wrap gap-1.5">
                {ideas.map((idea) => (
                  <li key={idea}>
                    <button
                      type="button"
                      aria-label={t.lectures.useIdea(idea)}
                      onClick={() => setTopic(capitalize(idea).slice(0, topicMaxLength))}
                      className="rounded-full border border-fig/30 bg-card px-3 py-1 text-sm text-fig transition-colors hover:bg-fig-surface focus-visible:outline-3 focus-visible:outline-info"
                    >
                      {idea}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <TextArea
            label={t.lectures.mainQuestion}
            hint={t.lectures.mainQuestionHint}
            placeholder={t.lectures.mainQuestionPlaceholder}
            maxLength={mainQuestionMaxLength}
            counter
            rows={3}
            value={mainQuestion}
            onChange={(event) => {
              setMainQuestion(event.target.value);
              setError(undefined);
            }}
          />
          {error && (
            <p role="alert" className="text-danger">
              {error}
            </p>
          )}
          <Button
            type="submit"
            variant="figure"
            size="lg"
            disabled={!figure}
            icon={<Play aria-hidden className="size-4" />}
          >
            {t.lectures.start}
          </Button>
        </form>
      )}
    </div>
  );
}

/** College aanvragen: kies een docent (die je kent), een onderwerp en één hoofdvraag. */
export function LectureRequestPage() {
  const { figureId } = useParams();
  const known = useDiscovered();
  const meta = figureId && known.has(figureId) ? findMeta(figureId) : undefined;
  const { figure } = useFigure(meta?.id);
  useDocumentTitle(meta ? `${t.lectures.requestTitle}: ${meta.name}` : t.lectures.requestTitle);

  if (!meta) {
    return (
      <>
        <PageHeader title={t.lectures.requestTitle} intro={t.lectures.intro} />
        <FigurePicker
          title={t.lectures.chooseTeacher}
          hint={t.lectures.pickTeacherHint}
          linkTo={(id) => `/colleges/aanvragen/${id}`}
        />
      </>
    );
  }

  return (
    <ThemeFrame figure={meta} className="pb-10">
      <RequestForm meta={meta} figure={figure} />
    </ThemeFrame>
  );
}
