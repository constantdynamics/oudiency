import { BookOpenText } from 'lucide-react';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { localDateKey } from '@/lib/dates';
import { dailyLimit, usedOn } from '@/services/limits.service';
import { useProfileStore } from '@/store/profileStore';
import { LectureRow } from './LectureRow';
import { isInLibrary, type LectureSummary, useAllLectureSummaries } from './summary';

const newestFirst = (a: LectureSummary, b: LectureSummary) =>
  Date.parse(b.date) - Date.parse(a.date);

/** Colleges: aanvragen, je eigen colleges en de bibliotheek (voorbeelden en gedeelde colleges). */
export function LecturesPage() {
  useDocumentTitle(t.lectures.title);
  const now = useNow(60_000);
  const profile = useProfileStore((s) => s.profile);
  const all = useAllLectureSummaries();
  const mine = all
    .filter((l) => !l.isExample)
    .sort(
      (a, b) => Number(b.status === 'bezig') - Number(a.status === 'bezig') || newestFirst(a, b),
    );
  const library = all.filter(isInLibrary).sort(newestFirst);
  const limit = dailyLimit('lectures', profile.tier);
  const used = Math.min(limit, usedOn(profile.usageByDate, 'lectures', localDateKey(now)));

  return (
    <>
      <PageHeader
        title={t.lectures.title}
        intro={t.lectures.intro}
        actions={
          <ButtonLink
            to="/colleges/aanvragen"
            icon={<BookOpenText aria-hidden className="size-4" />}
          >
            {t.lectures.request}
          </ButtonLink>
        }
      />
      <p className="text-ink-2">{t.lectures.today(used, limit)}</p>

      <section aria-labelledby="mijn-colleges" className="mt-8">
        <SectionTitle id="mijn-colleges">{t.lectures.mine}</SectionTitle>
        {mine.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {mine.map((lecture) => (
              <LectureRow key={lecture.id} lecture={lecture} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<BookOpenText aria-hidden className="size-8" />}
            title={t.lectures.empty}
            action={<ButtonLink to="/colleges/aanvragen">{t.lectures.request}</ButtonLink>}
          >
            {t.lectures.intro}
          </EmptyState>
        )}
      </section>

      <section aria-labelledby="bibliotheek" className="mt-10">
        <SectionTitle id="bibliotheek">{t.lectures.library}</SectionTitle>
        <p className="-mt-2 mb-4 text-ink-3">{t.lectures.libraryIntro}</p>
        {library.length > 0 ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {library.map((lecture) => (
              <LectureRow key={lecture.id} lecture={lecture} />
            ))}
          </div>
        ) : (
          <p className="text-ink-3">{t.lectures.libraryEmpty}</p>
        )}
      </section>
    </>
  );
}
