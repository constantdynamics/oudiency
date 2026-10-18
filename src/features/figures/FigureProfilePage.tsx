import { BookOpenText, CalendarClock, Landmark, Podcast } from 'lucide-react';
import { lazy, type ReactNode, Suspense, useEffect } from 'react';
import { useParams } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Pill } from '@/components/Badges';
import { ButtonLink } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { NativeText } from '@/components/NativeText';
import { SectionTitle } from '@/components/PageHeader';
import { ThemeFrame } from '@/components/ThemeFrame';
import { toast } from '@/components/toastStore';
import { findMeta, useFigure, type FigureMeta } from '@/data/figures';
import { lifespanOf } from '@/data/figures/format';
import type { Figure } from '@/data/types';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';
import { prefetchThought } from '@/services/thought.service';
import { useProfileStore } from '@/store/profileStore';
import { elevenLabsKeyStorage, useHasSecret } from '@/store/settingsStore';
import { LectureRow } from '../lectures/LectureRow';
import { isInLibrary, useAllLectureSummaries } from '../lectures/summary';
import { FollowButton } from './components';
import { isDiscovered, useDiscovered } from './discovery';
import {
  ConceptList,
  Lifeline,
  NetworkList,
  QuoteCard,
  SpecCard,
  ThoughtCard,
  WorksList,
} from './profileParts';

// Alleen met een ElevenLabs-sleutel: de stem van deze denker, en "Andere stem".
const VoiceLine = lazy(() => import('./VoiceLine').then((m) => ({ default: m.VoiceLine })));

function ProfileHeader({ meta }: { meta: FigureMeta }) {
  const hasVoiceKey = useHasSecret(elevenLabsKeyStorage);
  return (
    <header
      className="rounded-3xl border border-line bg-fig-surface p-5 shadow-card motif-bg sm:p-8"
      data-motif={meta.theme.motif}
    >
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar figure={meta} size={112} decorative={false} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium tracking-wide text-fig uppercase">{meta.epithet}</p>
          <h1 className="mt-1 font-fig text-5xl leading-none text-fig sm:text-6xl">{meta.name}</h1>
          {meta.nativeName && meta.nativeName !== meta.name && (
            <p className="mt-1 text-2xl text-fig">
              <NativeText text={meta.nativeName} />
            </p>
          )}
          <p className="mt-3 text-ink-2">
            {lifespanOf(meta)} · {meta.origin}
          </p>
          <p className="text-ink-2">{meta.school}</p>
          <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Thema's">
            {meta.tags.slice(0, 8).map((tag) => (
              <li key={tag}>
                <Pill tone="figure">{tag}</Pill>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-2">
            <FollowButton figureId={meta.id} size="md" />
            <ButtonLink
              to={`/sessies/boeken/${meta.id}`}
              variant="figure"
              icon={<CalendarClock aria-hidden className="size-4" />}
            >
              {t.figures.planSession}
            </ButtonLink>
            <ButtonLink
              to={`/colleges/aanvragen/${meta.id}`}
              variant="figure-outline"
              icon={<BookOpenText aria-hidden className="size-4" />}
            >
              {t.figures.requestLecture}
            </ButtonLink>
            <ButtonLink
              to={`/podcasts/nieuw?denker=${meta.id}`}
              variant="figure-outline"
              icon={<Podcast aria-hidden className="size-4" />}
            >
              {t.figures.makePodcast}
            </ButtonLink>
          </div>
          {hasVoiceKey && (
            <Suspense fallback={null}>
              <VoiceLine figureId={meta.id} name={meta.shortName ?? meta.name} />
            </Suspense>
          )}
        </div>
      </div>
    </header>
  );
}

/** Feed van kaarten: citaten en specificaties om en om (§6.5). */
function Feed({ figure }: { figure: Figure }) {
  const quotes = figure.quotes.filter((q) => q.verified);
  const specs = figure.specs;
  const items: ReactNode[] = [];
  const length = Math.max(quotes.length, specs.length);
  for (let i = 0; i < length; i++) {
    const quote = quotes[i];
    const spec = specs[i];
    if (quote) items.push(<QuoteCard key={`q-${quote.source}-${i}`} quote={quote} />);
    if (spec)
      items.push(<SpecCard key={`s-${spec.label}-${i}`} label={spec.label} value={spec.value} />);
  }
  return <div className="space-y-4">{items}</div>;
}

function FullProfile({ figure, meta }: { figure: Figure; meta: FigureMeta }) {
  const known = useDiscovered();
  const lectures = useAllLectureSummaries().filter((l) => l.figureId === figure.id);
  const library = lectures.filter(isInLibrary);
  const own = lectures.filter((l) => !isInLibrary(l));
  const shortName = figure.shortName ?? figure.name;

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-10">
        <ThoughtCard figure={figure} />

        <section aria-labelledby="over">
          <SectionTitle id="over">Over {shortName}</SectionTitle>
          <p className="max-w-[70ch] text-lg leading-relaxed text-ink-2">{figure.bio}</p>
        </section>

        <section aria-labelledby="feed">
          <SectionTitle id="feed">
            {t.figures.quotes} &amp; {t.figures.specs.toLowerCase()}
          </SectionTitle>
          <Feed figure={figure} />
        </section>

        <section aria-labelledby="levenslijn">
          <SectionTitle id="levenslijn">{t.figures.lifeline}</SectionTitle>
          <Lifeline figure={figure} />
        </section>

        <section aria-labelledby="begrippen">
          <SectionTitle id="begrippen">{t.figures.keyConcepts}</SectionTitle>
          <ConceptList figure={figure} />
        </section>
      </div>

      <aside className="space-y-6" aria-label={`Meer over ${shortName}`}>
        <Card as="section" aria-labelledby="netwerk">
          <h2 id="netwerk" className="mb-1 text-2xl">
            {t.figures.network_}
          </h2>
          <p className="mb-3 text-sm text-ink-3">
            {meta.network.length} {meta.network.length === 1 ? 'relatie' : 'relaties'} · ontdek wie
            er nog meer bij hoort
          </p>
          <NetworkList links={meta.network} of={shortName} known={known} />
        </Card>

        <Card as="section" aria-labelledby="werken">
          <h2 id="werken" className="mb-3 text-2xl">
            {t.figures.keyWorks}
          </h2>
          <WorksList figure={figure} />
        </Card>

        <Card as="section" aria-labelledby="nu">
          <h2 id="nu" className="mb-2 text-2xl">
            {t.figures.modernLens}
          </h2>
          <p className="text-ink-2">{figure.modernLens}</p>
          <p className="mt-2 text-xs text-ink-3">
            Zo kijkt de simulatie van {shortName} naar het heden.
          </p>
        </Card>

        {figure.controversies.length > 0 && (
          <Card as="section" aria-labelledby="schaduw">
            <h2 id="schaduw" className="mb-2 text-2xl">
              {t.figures.controversies}
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-ink-2">
              {figure.controversies.map((item) => (
                <li key={item.slice(0, 40)}>{item}</li>
              ))}
            </ul>
          </Card>
        )}

        <section aria-labelledby="colleges">
          <h2 id="colleges" className="mb-3 text-2xl">
            {t.figures.lecturesBy(shortName)}
          </h2>
          {library.length > 0 ? (
            <div className="space-y-2">
              {library.map((lecture) => (
                <LectureRow key={lecture.id} lecture={lecture} showFigure={false} />
              ))}
            </div>
          ) : (
            <p className="text-ink-3">{t.figures.noLectures}</p>
          )}
          {own.length > 0 && (
            <>
              <h3 className="mt-5 mb-2 text-xl">Jouw colleges</h3>
              <div className="space-y-2">
                {own.map((lecture) => (
                  <LectureRow key={lecture.id} lecture={lecture} showFigure={false} />
                ))}
              </div>
            </>
          )}
        </section>
      </aside>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mt-6 space-y-4" aria-hidden>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl bg-paper-2 motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

export function FigureProfilePage() {
  const { id } = useParams();
  const meta = findMeta(id);
  const { figure, status } = useFigure(meta?.id);
  const discovered = useProfileStore((s) => s.profile.discovered);
  const discover = useProfileStore((s) => s.discover);
  useDocumentTitle(meta?.name ?? t.errors.figureNotFound);

  // Een profiel openen (via een link, de denker van de dag of een reactie) is ontdekken.
  const metaId = meta?.id;
  useEffect(() => {
    if (metaId) prefetchThought(metaId);
  }, [metaId]);
  const alreadyKnown = metaId ? isDiscovered(metaId, discovered) : true;
  useEffect(() => {
    if (!metaId || alreadyKnown) return;
    if (discover(metaId)) toast(t.figures.newlyDiscovered(findMeta(metaId)?.name ?? metaId), 'ok');
  }, [metaId, alreadyKnown, discover]);

  if (!meta) {
    return (
      <EmptyState
        className="mt-6"
        icon={<Landmark aria-hidden className="size-8" />}
        title={t.errors.figureNotFound}
        action={<ButtonLink to="/denkers">Naar alle denkers</ButtonLink>}
      >
        Misschien is de link verouderd. In het overzicht vind je alle denkers die je al kent.
      </EmptyState>
    );
  }

  return (
    <ThemeFrame figure={meta}>
      <ProfileHeader meta={meta} />
      {figure ? (
        <FullProfile figure={figure} meta={meta} />
      ) : status === 'error' ? (
        <p className="mt-6 text-danger" role="alert">
          Dit profiel kon niet worden geladen. Controleer je verbinding en herlaad de pagina.
        </p>
      ) : (
        <ProfileSkeleton />
      )}
    </ThemeFrame>
  );
}
