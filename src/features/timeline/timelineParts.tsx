import {
  CalendarPlus,
  Check,
  Heart,
  MessageCircleQuestion,
  Pencil,
  Shuffle,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { AiLabel, Pill } from '@/components/Badges';
import { Button, IconButton } from '@/components/Button';
import { CrisisCard } from '@/components/CrisisCard';
import { Dialog } from '@/components/Dialog';
import { TextArea } from '@/components/Field';
import { ThemeFrame } from '@/components/ThemeFrame';
import { Thinking } from '@/components/Thinking';
import { toast } from '@/components/toastStore';
import { LIMITS } from '@/config/limits';
import { figureName, findMeta } from '@/data/figures';
import { t } from '@/i18n/nl';
import { timeAgo } from '@/lib/dates';
import { cx } from '@/lib/cx';
import { joinDutch } from '@/lib/text';
import {
  deletePost,
  editPost,
  PostError,
  type PostPrompt,
  togglePostLike,
  visibleReactions,
} from '@/services/timeline.service';
import { usePostStore } from '@/store/postStore';
import type { Post, Reaction } from '@/store/schemas';
import { useReactionJobs } from './reactionJobs';

/** Tekst met #hashtags gemarkeerd (zonder HTML uit de tekst zelf). */
export function HashtagText({ text }: { text: string }) {
  const parts = text.split(/(#[\p{L}\p{N}_-]{2,40})/gu);
  return (
    <p className="whitespace-pre-wrap">
      {parts.map((part, i) =>
        part.startsWith('#') && i % 2 === 1 ? (
          // eslint-disable-next-line @eslint-react/no-array-index-key -- vaste volgorde
          <span key={i} className="font-medium text-fig">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </p>
  );
}

/** De vraag van de dag (of de vervolgvraag), gesteld door een denker. */
export function QuestionCard({
  askerId,
  eyebrow,
  text,
  kind,
  answered,
  onAnswer,
  onReroll,
  onViewAnswer,
}: {
  askerId: string;
  eyebrow: string;
  text: string;
  kind?: string;
  answered?: boolean;
  onAnswer?: () => void;
  onReroll?: () => void;
  onViewAnswer?: () => void;
}) {
  const meta = findMeta(askerId);
  if (!meta) return null;
  return (
    <ThemeFrame
      figure={meta}
      motif
      as="section"
      className="rounded-3xl border border-line bg-fig-surface p-5 shadow-card sm:p-6"
    >
      <div className="flex items-start gap-4">
        <Avatar figure={meta} size={56} decorative={false} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-wide text-fig uppercase">{eyebrow}</p>
          <p className="mt-0.5 font-semibold">{t.timeline.asks(meta.shortName ?? meta.name)}</p>
          <p className="mt-2 font-fig text-2xl leading-snug text-fig">{text}</p>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <AiLabel />
            {kind && <Pill tone="figure">{kind}</Pill>}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {answered ? (
              <>
                <Pill tone="ok" icon={<Check aria-hidden className="size-3.5" />}>
                  {t.timeline.answered}
                </Pill>
                {onViewAnswer && (
                  <Button variant="ghost" size="sm" onClick={onViewAnswer}>
                    {t.timeline.viewAnswer}
                  </Button>
                )}
              </>
            ) : (
              <>
                {onAnswer && (
                  <Button
                    variant="figure"
                    size="sm"
                    icon={<MessageCircleQuestion aria-hidden className="size-4" />}
                    onClick={onAnswer}
                  >
                    {t.timeline.answer}
                  </Button>
                )}
                {onReroll && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Shuffle aria-hidden className="size-4" />}
                    onClick={onReroll}
                  >
                    {t.timeline.otherQuestion}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </ThemeFrame>
  );
}

/** Het invoerveld: een gedachte, of een antwoord op de vraag van de dag. */
export function Composer({
  prompt,
  onClearPrompt,
  onSubmit,
}: {
  prompt?: PostPrompt;
  onClearPrompt: () => void;
  onSubmit: (text: string) => boolean;
}) {
  const [text, setText] = useState('');
  const { postMaxLength } = LIMITS.timeline;
  const asker = prompt ? figureName(prompt.promptFigureId) : undefined;
  return (
    <form
      className="space-y-3 rounded-2xl border border-line bg-card p-4 shadow-card"
      onSubmit={(event) => {
        event.preventDefault();
        if (onSubmit(text)) setText('');
      }}
    >
      {prompt && asker && (
        <div className="flex items-start gap-2 rounded-xl bg-fig-surface px-3 py-2 text-sm">
          <p className="min-w-0 flex-1">
            <span className="font-semibold">{t.timeline.answeringTo(asker)}: </span>
            {prompt.promptText}
          </p>
          <IconButton label={t.timeline.stopAnswering} className="size-8" onClick={onClearPrompt}>
            <X aria-hidden className="size-4" />
          </IconButton>
        </div>
      )}
      <TextArea
        data-composer
        label={prompt ? t.timeline.answerLabel : t.timeline.composerLabel}
        placeholder={t.timeline.composerPlaceholder}
        hint={t.timeline.hashtagHint}
        maxLength={postMaxLength}
        counter
        rows={3}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      <div className="flex justify-end">
        <Button type="submit" disabled={!text.trim()}>
          {t.timeline.post}
        </Button>
      </div>
    </form>
  );
}

function ReactionCard({ reaction }: { reaction: Reaction }) {
  const meta = findMeta(reaction.figureId);
  if (!meta || !reaction.text) return null;
  const name = meta.shortName ?? meta.name;
  return (
    <ThemeFrame
      figure={meta}
      as="li"
      className="rounded-2xl border border-line bg-paper p-3 sm:p-4"
    >
      <div className="flex items-start gap-3">
        <Avatar figure={meta} size={40} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Link
              to={`/denkers/${meta.id}`}
              className="font-display text-lg font-semibold text-fig hover:underline"
            >
              {meta.name}
            </Link>
            {reaction.discovery && <Pill tone="gold">{t.timeline.newlyDiscovered}</Pill>}
            <AiLabel />
          </p>
          <p className="mt-1 leading-relaxed">{reaction.text}</p>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {reaction.discovery && (
              <Link to={`/denkers/${meta.id}`} className="text-fig underline underline-offset-2">
                {t.timeline.viewProfile}
              </Link>
            )}
            <Link
              to={`/sessies/boeken/${meta.id}`}
              className="inline-flex items-center gap-1 text-ink-2 underline underline-offset-2 hover:text-ink"
            >
              <CalendarPlus aria-hidden className="size-3.5" />
              {t.timeline.goDeeper(name)}
            </Link>
          </p>
        </div>
      </div>
    </ThemeFrame>
  );
}

function Reactions({ post, now }: { post: Post; now: number }) {
  const visible = visibleReactions(post, now);
  const unseen = visible.filter((r) => !r.seen).map((r) => r.id);
  const unseenKey = unseen.join(',');
  useEffect(() => {
    if (unseenKey) usePostStore.getState().markReactionsSeen(unseenKey.split(','));
  }, [unseenKey]);
  const likes = visible.filter((r) => r.type === 'like');
  const comments = visible.filter((r) => r.type === 'comment');
  if (visible.length === 0) return null;
  return (
    <div className="mt-3 space-y-2 border-t border-line pt-3" aria-label="Reacties van denkers">
      {likes.length > 0 && (
        <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
          <span className="flex -space-x-2">
            {likes.map((like) => {
              const meta = findMeta(like.figureId);
              return meta ? (
                <Avatar key={like.id} figure={meta} size={28} className="ring-2 ring-card" />
              ) : null;
            })}
          </span>
          <Heart aria-hidden className="size-3.5 fill-current text-terracotta" />
          {t.timeline.likedBy(
            joinDutch(likes.map((l) => figureName(l.figureId))),
            likes.length > 1,
          )}
          {likes.some((l) => l.discovery) && <Pill tone="gold">{t.timeline.newlyDiscovered}</Pill>}
        </p>
      )}
      {comments.length > 0 && (
        <ul className="space-y-2">
          {comments.map((reaction) => (
            <ReactionCard key={reaction.id} reaction={reaction} />
          ))}
        </ul>
      )}
    </div>
  );
}

/** Eén bericht met reacties, en (voor je eigen bericht) liken, bewerken en verwijderen. */
export function PostCard({ post, now }: { post: Post; now: number }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.text);
  const [error, setError] = useState<string>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const reading = useReactionJobs((s) => Boolean(s.pending[post.id]));
  const asker = post.promptFigureId ? figureName(post.promptFigureId) : undefined;

  const save = () => {
    try {
      editPost(post.id, draft);
      setEditing(false);
      setError(undefined);
    } catch (problem) {
      setError(problem instanceof PostError ? problem.message : t.errors.generic);
    }
  };

  return (
    <article
      id={`bericht-${post.id}`}
      tabIndex={-1}
      className="scroll-mt-[calc(var(--header-h)+1rem)] rounded-2xl border border-line bg-card p-4 shadow-card focus:outline-none sm:p-5"
    >
      {post.promptText && asker && (
        <p className="mb-2 text-sm text-ink-3">
          <span className="font-semibold text-ink-2">
            {post.isFollowUp ? t.timeline.followUpBy(asker) : t.timeline.questionFrom(asker)}:{' '}
          </span>
          {post.promptText}
        </p>
      )}
      {editing ? (
        <div className="space-y-2">
          <TextArea
            label={t.timeline.edit}
            hideLabel
            maxLength={LIMITS.timeline.postMaxLength}
            counter
            rows={3}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setEditing(false);
                setDraft(post.text);
              }}
            >
              {t.app.cancel}
            </Button>
            <Button size="sm" onClick={save} disabled={!draft.trim()}>
              {t.timeline.save}
            </Button>
          </div>
        </div>
      ) : (
        <HashtagText text={post.text} />
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-3">
        <time dateTime={post.createdAt}>{timeAgo(Date.parse(post.createdAt), now)}</time>
        {post.editedAt && <span>· {t.timeline.edited}</span>}
        <div
          className="ml-auto flex items-center gap-1"
          role="group"
          aria-label={t.timeline.postActions}
        >
          <IconButton
            label={post.likedByMe ? t.timeline.liked : t.timeline.like}
            aria-pressed={Boolean(post.likedByMe)}
            className="size-9"
            onClick={() => togglePostLike(post.id)}
          >
            <Heart
              aria-hidden
              className={cx('size-4', post.likedByMe && 'fill-current text-terracotta')}
            />
          </IconButton>
          {!editing && !post.crisis && (
            <IconButton label={t.timeline.edit} className="size-9" onClick={() => setEditing(true)}>
              <Pencil aria-hidden className="size-4" />
            </IconButton>
          )}
          <IconButton
            label={t.timeline.delete}
            className="size-9"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 aria-hidden className="size-4" />
          </IconButton>
        </div>
      </div>
      {post.crisis ? (
        <div className="mt-3 space-y-2">
          <p className="text-sm text-ink-2">{t.crisis.noReactions}</p>
          <CrisisCard />
        </div>
      ) : (
        <>
          {reading && <Thinking className="mt-3 text-sm" text={t.timeline.reactionsPending} />}
          <Reactions post={post} now={now} />
        </>
      )}
      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t.timeline.delete}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
              {t.app.cancel}
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setConfirmDelete(false);
                deletePost(post.id);
                toast(t.timeline.deleted, 'ok');
              }}
            >
              {t.timeline.delete}
            </Button>
          </>
        }
      >
        <p>{t.timeline.deleteConfirm}</p>
      </Dialog>
    </article>
  );
}
