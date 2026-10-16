import { MessagesSquare } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAiMode } from '@/ai';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { toast } from '@/components/toastStore';
import { useFigure } from '@/data/figures';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { localDateKey } from '@/lib/dates';
import {
  canReroll,
  currentQuestion,
  ensureToday,
  openFollowUp,
  planDay,
  rerollToday,
} from '@/services/dailyQuestion.service';
import { createPost, PostError, type PostPrompt } from '@/services/timeline.service';
import { useDailyQuestionStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import { requestReactions, useReactionJobs } from './reactionJobs';
import { Composer, PostCard, QuestionCard } from './timelineParts';

function focusComposer() {
  requestAnimationFrame(() => {
    const field = document.querySelector<HTMLTextAreaElement>('textarea[data-composer]');
    field?.scrollIntoView?.({ block: 'center' });
    field?.focus({ preventScroll: true });
  });
}

function goToPost(postId: string) {
  const post = document.getElementById(`bericht-${postId}`);
  post?.scrollIntoView?.({ block: 'start' });
  post?.focus({ preventScroll: true });
}

/** De eigen timeline: de vraag van de dag, het invoerveld en je berichten met reacties. */
export function TimelinePage() {
  useDocumentTitle(t.timeline.title);
  // De klok tikt elke 15 s; na een reactieronde meteen, zodat directe reacties niet wachten.
  const lastRunAt = useReactionJobs((s) => s.lastRunAt);
  const now = Math.max(useNow(15_000), lastRunAt);
  const todayKey = localDateKey(now);
  const posts = usePostStore((s) => s.posts);
  const storedDay = useDailyQuestionStore((s) => s.days[todayKey]);
  // Het eerste bezoek van de dag: toon meteen de vraag die ensureToday hieronder vastlegt.
  const day = storedDay ?? planDay(todayKey);
  const [prompt, setPrompt] = useState<PostPrompt>();
  const demo = useAiMode() === 'demo';
  const question = currentQuestion(day);
  const { figure: asker } = useFigure(day.askerId);
  const followUp = openFollowUp(day, now);

  // De vraag van vandaag vastleggen (zelfde vraag de hele dag, geen herhaling binnen 30 dagen).
  useEffect(() => {
    ensureToday();
  }, [todayKey]);

  // Met een eigen key stelt de denker de vraag in de eigen stijl (één keer per vraag per dag).
  const styledAlready = Boolean(question && day.styled?.[question.id]);
  useEffect(() => {
    if (demo || !asker || !question || styledAlready) return;
    void import('@/services/timelineAi').then((ai) =>
      ai.styleDailyQuestion(todayKey, question.id, asker),
    );
  }, [demo, asker, question, styledAlready, todayKey]);

  const questionText = question ? (day.styled?.[question.id] ?? question.text) : '';

  const answer = (isFollowUp: boolean) => {
    if (!question) return;
    setPrompt({
      promptId: question.id,
      promptText: isFollowUp ? question.followUp : questionText,
      promptFigureId: day.askerId,
      isFollowUp,
    });
    focusComposer();
  };

  const submit = (text: string): boolean => {
    try {
      const post = createPost(text, prompt);
      setPrompt(undefined);
      if (!post.crisis) {
        toast(t.timeline.posted, 'ok');
        void requestReactions(post.id);
      }
      return true;
    } catch (problem) {
      toast(problem instanceof PostError ? problem.message : t.errors.generic, 'warn');
      return false;
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={t.timeline.title} intro={t.timeline.intro} className="mb-0" />

      {question && (
        <QuestionCard
          askerId={day.askerId}
          eyebrow={t.timeline.dailyQuestion}
          text={questionText}
          kind={question.kind}
          answered={Boolean(day.answeredPostId)}
          onAnswer={() => answer(false)}
          onReroll={canReroll(day) ? () => rerollToday() : undefined}
          onViewAnswer={day.answeredPostId ? () => goToPost(day.answeredPostId!) : undefined}
        />
      )}

      {followUp && (
        <QuestionCard
          askerId={day.askerId}
          eyebrow={t.timeline.followUp}
          text={followUp.text}
          onAnswer={() => answer(true)}
        />
      )}

      <Composer prompt={prompt} onClearPrompt={() => setPrompt(undefined)} onSubmit={submit} />

      <section aria-labelledby="berichten" className="space-y-4">
        <SectionTitle id="berichten">{t.timeline.feed}</SectionTitle>
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.id} post={post} now={now} />)
        ) : (
          <EmptyState
            icon={<MessagesSquare aria-hidden className="size-8" />}
            title={t.timeline.empty}
          />
        )}
      </section>
    </div>
  );
}
