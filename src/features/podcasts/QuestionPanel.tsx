/**
 * Een vraag stellen tijdens een aflevering (keuzes 7a, 7c en 7e): typen, of live inbellen. Het
 * antwoord klinkt direct na het fragment dat nu speelt.
 */
import { MessageCircleQuestion, Phone, Send } from 'lucide-react';
import { useId, useState } from 'react';
import { detectCrisisSignals } from '@/ai/prompts/safety';
import { Button, ButtonLink } from '@/components/Button';
import { CrisisCard } from '@/components/CrisisCard';
import { TextArea } from '@/components/Field';
import { Thinking } from '@/components/Thinking';
import { PODCAST } from '@/config/podcast';
import { HOST_ID } from '@/data/podcastHost';
import { tp } from '@/i18n/podcast';
import { calleeOf } from '@/podcast/episodeInfo';
import { useQuestion } from '@/podcast/questionState';
import type { PodcastEpisode } from '@/store/schemas';
import { episodeFigures } from './format';
import { usePodcastKeys } from './usePodcastKeys';

type Problem = 'leeg' | 'crisis';

export function QuestionPanel({ episode }: { episode: PodcastEpisode }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [problem, setProblem] = useState<Problem | null>(null);
  const question = useQuestion();
  const keys = usePodcastKeys();
  const panelId = useId();
  const mine = question.episodeId === episode.id;
  const writing = mine && question.status === 'schrijven';
  const figures = episodeFigures(episode);
  const names = figures.map((meta) => meta.shortName ?? meta.name).join(' en ');
  const callee = calleeOf(episode);
  const calleeName = figures.find((meta) => meta.id === callee)?.shortName ?? names;

  const submit = () => {
    const clean = text.trim();
    if (!clean) {
      setProblem('leeg');
      return;
    }
    if (detectCrisisSignals(clean)) {
      setProblem('crisis');
      return;
    }
    setProblem(null);
    void import('@/podcast/listenerQuestion').then(async (m) => {
      await m.submitQuestion(episode.id, { question: clean });
      if (useQuestion.getState().status === 'klaar') setText('');
    });
  };

  return (
    <div className="mt-4 border-t border-line pt-3">
      <Button
        variant="secondary"
        size="sm"
        aria-expanded={open}
        aria-controls={panelId}
        icon={<MessageCircleQuestion aria-hidden className="size-4" />}
        onClick={() => setOpen(!open)}
      >
        {open ? tp.question.close : tp.question.open}
      </Button>
      {mine && question.status === 'schrijven' && (
        <Thinking text={tp.question.writing} className="mt-2 text-sm" />
      )}
      {mine && question.status === 'klaar' && (
        <p role="status" className="mt-2 text-sm text-ok">
          {tp.question.done}
        </p>
      )}
      {mine && question.status === 'fout' && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {question.error ?? tp.question.failed}
        </p>
      )}
      {open && (
        <div id={panelId} className="mt-3 space-y-3">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              submit();
            }}
          >
            <TextArea
              label={tp.question.label(names)}
              hint={tp.question.hint}
              placeholder={tp.question.placeholder}
              maxLength={PODCAST.questionMaxLength}
              counter
              rows={3}
              value={text}
              onChange={(event) => {
                setText(event.target.value);
                setProblem(null);
              }}
            />
            {problem && (
              <p role="alert" className="mt-2 text-sm text-danger">
                {problem === 'crisis' ? tp.question.crisis : tp.question.empty}
              </p>
            )}
            {problem === 'crisis' && <CrisisCard className="mt-3" />}
            <Button
              type="submit"
              className="mt-3"
              size="sm"
              disabled={writing || !keys.claude}
              icon={<Send aria-hidden className="size-4" />}
            >
              {tp.question.send}
            </Button>
          </form>
          {keys.elevenLabs && (
            <div className="rounded-xl border border-line bg-paper p-3">
              <p className="text-sm font-medium">{tp.question.orCall}</p>
              <ButtonLink
                className="mt-2"
                variant="secondary"
                size="sm"
                to={`/podcasts/${episode.id}/bellen`}
                icon={<Phone aria-hidden className="size-4" />}
              >
                {callee === HOST_ID ? tp.question.callHost : tp.question.callFigure(calleeName)}
              </ButtonLink>
              <p className="mt-1.5 text-sm text-ink-3">
                {callee === HOST_ID ? tp.question.callHostHint(names) : tp.question.callFigureHint}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
