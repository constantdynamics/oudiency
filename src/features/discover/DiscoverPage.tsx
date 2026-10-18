import { BookOpenText } from 'lucide-react';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { ButtonLink } from '@/components/Button';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { findMeta } from '@/data/figures';
import { discoveredSet, teaserHint } from '@/features/figures/discovery';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { localDateKey } from '@/lib/dates';
import {
  figureOfTheDay,
  hasFilters,
  interestsFrom,
  type LectureFilters,
  type LengthBucket,
  popularQuestions,
  recommendLectures,
  searchLectures,
  themesOf,
  topLectures,
  trendingLectures,
  trendingTopics,
} from '@/services/discover.service';
import { useCacheStore, useLibraryStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import { useProfileStore } from '@/store/profileStore';
import { useSessionStore } from '@/store/sessionStore';
import { LectureRow } from '../lectures/LectureRow';
import { isInLibrary, useAllLectureSummaries } from '../lectures/summary';
import {
  FigureOfTheDayCard,
  HelpMe,
  LectureCard,
  QuestionList,
  ResearchTeaser,
  SearchPanel,
  TopicChips,
} from './discoverParts';

const LENGTHS = new Set<LengthBucket>(['kort', 'middel', 'lang']);

/** De homepage: wie kan mij helpen, denker van de dag, zoeken en de bibliotheek in lijsten. */
export function DiscoverPage() {
  useDocumentTitle(t.discover.title);
  const now = useNow(60_000);
  const [params, setParams] = useSearchParams();
  const all = useAllLectureSummaries();
  const likes = useLibraryStore((s) => s.likes);
  const watched = useLibraryStore((s) => s.watched);
  const profile = useProfileStore((s) => s.profile);
  const posts = usePostStore((s) => s.posts);
  const sessions = useSessionStore((s) => s.sessions);
  const dateKey = localDateKey(now);

  const known = useMemo(() => discoveredSet(profile.discovered), [profile.discovered]);
  // De denker van de dag ligt vast voor de dag, ook als je hem vandaag ontdekt.
  const cached = useCacheStore((s) => s.figureOfTheDay);
  const pickedId = cached?.dateKey === dateKey ? cached.figureId : undefined;
  const provisional = useMemo(() => figureOfTheDay(dateKey, known), [dateKey, known]);
  const ofTheDay = findMeta(pickedId) ?? provisional;
  useEffect(() => {
    if (!pickedId) useCacheStore.getState().setFigureOfTheDay(dateKey, provisional.id);
  }, [pickedId, dateKey, provisional.id]);

  const length = params.get('lengte') as LengthBucket | null;
  const filters: LectureFilters = {
    query: params.get('zoek') ?? '',
    figureId: params.get('denker') ?? undefined,
    theme: params.get('thema') ?? undefined,
    length: length && LENGTHS.has(length) ? length : undefined,
  };
  const searching = hasFilters(filters);

  const update = (patch: Partial<LectureFilters>) => {
    const next = { ...filters, ...patch };
    const entries: [string, string | undefined][] = [
      ['zoek', next.query?.trim() ? next.query : undefined],
      ['denker', next.figureId],
      ['thema', next.theme],
      ['lengte', next.length],
    ];
    setParams(
      Object.fromEntries(entries.filter((entry): entry is [string, string] => Boolean(entry[1]))),
      { replace: true },
    );
  };

  const library = all.filter(isInLibrary);
  const results = searching ? searchLectures(all, filters) : [];
  const completed = new Set(
    Object.entries(watched)
      .filter(([, w]) => w.completedAt)
      .map(([id]) => id),
  );
  const interests = interestsFrom({
    ownTags: all.filter((l) => !l.isExample).flatMap((l) => l.tags),
    likedTags: all.filter((l) => likes[l.id]).flatMap((l) => l.tags),
    postTags: posts.flatMap((p) => p.tags),
    sessionTopics: sessions.flatMap((s) => s.topics ?? []),
  });
  const recommended = recommendLectures(library, interests, new Set(profile.follows), completed, 3);
  const top = topLectures(library, likes, 4);
  const trending = trendingLectures(library, likes, now, 4);
  const topics = trendingTopics(library, 10);
  const questions = popularQuestions(library, likes, 4);

  return (
    <>
      <PageHeader title={t.discover.hero} intro={t.discover.heroIntro} />
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 space-y-10">
          <HelpMe />
          <ResearchTeaser />

          <FigureOfTheDayCard
            meta={ofTheDay}
            known={known.has(ofTheDay.id)}
            hint={teaserHint(ofTheDay.id, known)}
          />

          <section aria-labelledby="zoeken" className="space-y-4">
            <SectionTitle id="zoeken">{t.discover.search}</SectionTitle>
            <SearchPanel
              filters={filters}
              themes={themesOf(all)}
              figureIds={[...new Set(all.map((l) => l.figureId))]}
              onChange={update}
              onClear={() => setParams({}, { replace: true })}
            />
            {searching && (
              <div className="space-y-3">
                <p aria-live="polite" className="text-ink-2">
                  {t.discover.results(results.length)}
                </p>
                {results.length > 0 ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {results.map((lecture) => (
                      <LectureRow key={lecture.id} lecture={lecture} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-ink-3">{t.discover.noResults}</p>
                    <ButtonLink
                      to="/colleges/aanvragen"
                      variant="secondary"
                      size="sm"
                      icon={<BookOpenText aria-hidden className="size-4" />}
                    >
                      {t.lectures.request}
                    </ButtonLink>
                  </div>
                )}
              </div>
            )}
          </section>

          {!searching && (
            <>
              <section aria-labelledby="aanbevolen">
                <SectionTitle id="aanbevolen">{t.discover.recommended}</SectionTitle>
                {recommended.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {recommended.map((lecture) => (
                      <LectureCard key={lecture.id} lecture={lecture} />
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-3">{t.discover.recommendedEmpty}</p>
                )}
              </section>

              <section aria-labelledby="top">
                <SectionTitle id="top">{t.discover.topLectures}</SectionTitle>
                <p className="-mt-2 mb-4 text-sm text-ink-3">{t.discover.phase1Note}</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  {top.map((lecture) => (
                    <LectureCard key={lecture.id} lecture={lecture} />
                  ))}
                </div>
                <div className="mt-4">
                  <ButtonLink to="/colleges" variant="ghost" size="sm">
                    {t.discover.allLectures}
                  </ButtonLink>
                </div>
              </section>

              <section aria-labelledby="trending">
                <SectionTitle id="trending">{t.discover.trending}</SectionTitle>
                {trending.length > 0 ? (
                  <div className="grid gap-3 lg:grid-cols-2">
                    {trending.map((lecture) => (
                      <LectureRow key={lecture.id} lecture={lecture} />
                    ))}
                  </div>
                ) : (
                  <p className="text-ink-3">{t.discover.trendingEmpty}</p>
                )}
              </section>
            </>
          )}
        </div>

        <aside className="space-y-10">
          <section aria-labelledby="onderwerpen">
            <SectionTitle id="onderwerpen">{t.discover.topics}</SectionTitle>
            <TopicChips topics={topics} />
          </section>
          <section aria-labelledby="vragen">
            <SectionTitle id="vragen">{t.discover.questions}</SectionTitle>
            <QuestionList lectures={questions} />
          </section>
        </aside>
      </div>
    </>
  );
}
