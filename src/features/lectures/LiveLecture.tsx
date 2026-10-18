import { ArrowRight, MessageCircleQuestion, Play } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useAiMode } from '@/ai';
import { AiErrorNote } from '@/components/AiErrorNote';
import { Pill } from '@/components/Badges';
import { Button, ButtonLink } from '@/components/Button';
import { CrisisCard } from '@/components/CrisisCard';
import { Thinking } from '@/components/Thinking';
import { LIMITS } from '@/config/limits';
import { type FigureMeta, findMeta } from '@/data/figures';
import type { Figure } from '@/data/types';
import { t } from '@/i18n/nl';
import {
  askQuestion,
  canAsk,
  lectureProgress,
  type LectureStep,
  nextStep,
  partNumbers,
  questionsLeft,
  speakerOf,
  stepHeading,
} from '@/services/lecture.service';
import { useProfileStore } from '@/store/profileStore';
import { useSettingsStore } from '@/store/settingsStore';
import type { Lecture } from '@/store/schemas';
import { guestMetas } from './guests';
import {
  GuestLabel,
  LectureHall,
  ProgressSteps,
  QuestionBlock,
  QuestionForm,
  SegmentBlock,
} from './lectureParts';
import { clearRunError, isRunning, runNext, useLectureRun } from './liveLecture';

function nextLabel(lecture: Lecture, step: LectureStep): string | undefined {
  if (step.kind === 'deel') return t.lectures.nextPart(step.part, stepHeading(lecture, step));
  if (step.kind === 'conclusie') return t.lectures.nextConclusion;
  if (step.kind === 'antwoord') return t.lectures.nextAnswer;
  return undefined;
}

/** Het onderdeel dat nu binnenkomt; scrolt bij een nieuw onderdeel naar de kop. */
function LiveSegment({
  lecture,
  step,
  text,
  thinking,
  scroll,
}: {
  lecture: Lecture;
  step: LectureStep;
  text: string;
  thinking: string;
  scroll: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scroll) ref.current?.scrollIntoView?.({ block: 'start' });
  }, [scroll]);
  const part = step.kind === 'deel' ? step.part : undefined;
  const heading = stepHeading(lecture, step);
  const speaker = speakerOf(lecture, step);
  const guest = speaker !== lecture.figureId ? findMeta(speaker) : undefined;
  return (
    <div ref={ref} className="scroll-mt-[calc(var(--header-h)+1rem)]">
      {text && step.kind !== 'plan' && step.kind !== 'klaar' ? (
        <SegmentBlock
          segment={{ kind: step.kind, heading, text }}
          index={lecture.segments.length}
          part={part}
          guest={guest}
          streaming
          live
        />
      ) : (
        <div>
          {guest && <GuestLabel guest={guest} />}
          {part !== undefined && (
            <p className="text-sm font-semibold tracking-wide text-fig uppercase">
              {t.lectures.part(part)}
            </p>
          )}
          <p className="font-fig text-2xl text-fig">{heading}</p>
          <Thinking
            className="mt-3"
            text={guest ? t.lectures.guestPreparing(guest.shortName ?? guest.name) : thinking}
          />
        </div>
      )}
    </div>
  );
}

/** Een college dat nog loopt: plan, opening, delen met vragen, conclusie. */
export function LiveLecture({
  lecture,
  meta,
  figure,
}: {
  lecture: Lecture;
  meta: FigureMeta;
  figure: Figure;
}) {
  const run = useLectureRun();
  const running = isRunning(run, lecture.id);
  const failed = run.lectureId === lecture.id && run.status === 'fout';
  const displayName = useProfileStore((s) => s.profile.displayName);
  const demo = useAiMode() === 'demo';
  const [asking, setAsking] = useState(false);
  const [question, setQuestion] = useState('');
  const [crisis, setCrisis] = useState(false);
  const name = meta.shortName ?? meta.name;
  const step = nextStep(lecture);
  const progress = lectureProgress(lecture);
  const left = questionsLeft(lecture);
  const { maxQuestions, questionMaxLength } = LIMITS.lecture;

  const proceed = () => {
    setAsking(false);
    void runNext(lecture.id, figure, displayName);
  };

  const submitQuestion = () => {
    const result = askQuestion(lecture.id, question);
    if (result === 'crisis') {
      setCrisis(true);
      setAsking(false);
      setQuestion('');
      return;
    }
    if (result !== 'ok') return;
    setQuestion('');
    setAsking(false);
    void runNext(lecture.id, figure, displayName);
  };

  const retry = () => {
    clearRunError();
    void runNext(lecture.id, figure, displayName);
  };

  // Lukt het met de eigen key niet (key, tegoed, model), dan kun je in de demomodus verder.
  const switchToDemo = () => {
    useSettingsStore.getState().update({ aiSource: 'demo' });
    retry();
  };

  const parts = partNumbers(lecture.segments);
  const avatar = running ? (run.status === 'schrijft' ? 'speaking' : 'thinking') : 'listening';
  const hint = nextLabel(lecture, step);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <LectureHall
        meta={meta}
        title={lecture.plan?.title ?? lecture.topic}
        mainQuestion={lecture.mainQuestion}
        eyebrow={t.lectures.hall(name)}
        state={avatar}
        demo={demo}
        guests={guestMetas(lecture.guestIds)}
      >
        <div className="mt-5">
          <ProgressSteps done={progress.done} total={progress.total} />
        </div>
      </LectureHall>

      {lecture.segments.map((segment, index) => (
        <Fragment key={segment.index}>
          <SegmentBlock
            segment={segment}
            index={index}
            part={parts[index]}
            guest={segment.figureId ? findMeta(segment.figureId) : undefined}
          />
          {lecture.questions
            .filter((q) => q.afterSegment === index)
            .map((q) => (
              <QuestionBlock key={`${q.afterSegment}-${q.text.slice(0, 20)}`} text={q.text} />
            ))}
        </Fragment>
      ))}

      {running &&
        (run.status === 'plant' ? (
          <Thinking text={t.lectures.preparing(name)} />
        ) : (
          <LiveSegment
            lecture={lecture}
            step={step}
            text={run.text}
            thinking={figure.microcopy.thinking}
            scroll={lecture.segments.length > 0}
          />
        ))}

      {failed && (
        <AiErrorNote
          error={run.error ?? { kind: 'other', message: t.lectures.error }}
          onRetry={retry}
          retryLabel={t.lectures.retry}
          onUseDemo={switchToDemo}
        />
      )}

      {crisis && (
        <div className="space-y-3">
          <CrisisCard />
          <p className="text-sm text-ink-3">{t.lectures.questionNotSent}</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setCrisis(false)}>
              {t.lectures.continue}
            </Button>
            <ButtonLink to="/colleges" variant="ghost">
              {t.lectures.toLectures}
            </ButtonLink>
          </div>
        </div>
      )}

      {!running && !failed && !crisis && (
        <div className="space-y-3 border-t border-line pt-6">
          {lecture.segments.length === 0 ? (
            <Button
              variant="figure"
              size="lg"
              icon={<Play aria-hidden className="size-4" />}
              onClick={proceed}
            >
              {t.lectures.begin}
            </Button>
          ) : asking ? (
            <QuestionForm
              value={question}
              onChange={setQuestion}
              onSubmit={submitQuestion}
              onCancel={() => setAsking(false)}
              left={left}
              max={maxQuestions}
              maxLength={questionMaxLength}
            />
          ) : (
            <>
              {hint && <p className="text-ink-2">{hint}</p>}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="figure"
                  icon={<ArrowRight aria-hidden className="size-4" />}
                  onClick={proceed}
                >
                  {t.lectures.continue}
                </Button>
                {canAsk(lecture) && (
                  <Button
                    variant="figure-outline"
                    icon={<MessageCircleQuestion aria-hidden className="size-4" />}
                    onClick={() => setAsking(true)}
                  >
                    {t.lectures.askQuestion}
                  </Button>
                )}
                {lecture.segments.length > 1 && (
                  <Pill tone="figure" className="ml-auto">
                    {left > 0
                      ? t.lectures.questionsLeft(left, maxQuestions)
                      : t.lectures.noQuestionsLeft}
                  </Pill>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
