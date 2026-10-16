import { BookX } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useAiMode } from '@/ai';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { ThemeFrame } from '@/components/ThemeFrame';
import { Thinking } from '@/components/Thinking';
import { findMeta, useFigure } from '@/data/figures';
import { findExampleLecture, loadExampleLecture } from '@/data/seed/lectures';
import type { ExampleLecture } from '@/data/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';
import { viewOfExample, viewOfLecture } from '@/services/lecture.service';
import { useLectureStore } from '@/store/lectureStore';
import { LectureReplay } from './LectureReplay';
import { LiveLecture } from './LiveLecture';

/** Een voorbeeldcollege: de tekst laadt pas als je het opent (eigen chunk). */
function useExampleLecture(id: string): { lecture?: ExampleLecture; failed: boolean } {
  const [loaded, setLoaded] = useState<{
    id: string;
    lecture?: ExampleLecture;
    failed?: boolean;
  }>();
  const known = Boolean(findExampleLecture(id));
  useEffect(() => {
    if (!known) return;
    let active = true;
    loadExampleLecture(id).then(
      (lecture) => active && setLoaded({ id, lecture, failed: !lecture }),
      () => active && setLoaded({ id, failed: true }),
    );
    return () => {
      active = false;
    };
  }, [id, known]);
  return loaded?.id === id
    ? { lecture: loaded.lecture, failed: Boolean(loaded.failed) }
    : { failed: false };
}

export function LecturePage() {
  const { id = '' } = useParams();
  const own = useLectureStore((s) => s.lectures.find((l) => l.id === id));
  const exampleMeta = findExampleLecture(id);
  const example = useExampleLecture(id);
  const meta = findMeta(own?.figureId ?? exampleMeta?.figureId);
  const { figure } = useFigure(meta?.id);
  const demo = useAiMode() === 'demo';
  useDocumentTitle(
    own || exampleMeta
      ? `${own?.plan?.title ?? own?.topic ?? exampleMeta?.title} · ${t.lectures.title}`
      : t.lectures.notFound,
  );

  if (!meta || (!own && !exampleMeta) || example.failed) {
    return (
      <EmptyState
        className="mt-6"
        icon={<BookX aria-hidden className="size-8" />}
        title={t.lectures.notFound}
        action={<ButtonLink to="/colleges">{t.lectures.toLectures}</ButtonLink>}
      >
        {t.lectures.notFoundBody}
      </EmptyState>
    );
  }

  let content;
  if (!figure || (!own && !example.lecture)) {
    content = <Thinking className="mt-10 justify-center" text={t.app.loading} />;
  } else if (own && own.status === 'bezig') {
    content = <LiveLecture lecture={own} meta={meta} figure={figure} />;
  } else {
    const view = own ? viewOfLecture(own) : viewOfExample(example.lecture as ExampleLecture);
    content = <LectureReplay view={view} meta={meta} figure={figure} demo={demo} />;
  }

  return (
    <ThemeFrame figure={meta} className="pb-10">
      {content}
    </ThemeFrame>
  );
}
