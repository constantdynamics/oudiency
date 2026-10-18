import { FileSearch, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { Pill } from '@/components/Badges';
import { ButtonLink } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { PageHeader } from '@/components/PageHeader';
import { LIMITS } from '@/config/limits';
import { usePodcastKeys } from '@/features/podcasts/usePodcastKeys';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { tr } from '@/i18n/research';
import { formatShortDate, localDateKey } from '@/lib/dates';
import { useActiveWork } from '@/research/researchState';
import { remainingOn } from '@/services/limits.service';
import { useProfileStore } from '@/store/profileStore';
import type { Research } from '@/store/researchSchemas';
import { useResearchStore } from '@/store/researchStore';
import { figureNames, formLabel, phaseOf } from './format';
import { BackToDiscover, FigureRow, StatusPill } from './researchParts';

function ResearchRow({ research }: { research: Research }) {
  const title = research.title ?? research.question;
  const forms = [...new Set(research.outputs.filter((o) => o.status === 'klaar').map(formLabel))];
  return (
    <li>
      <Link
        to={`/onderzoek/${research.id}`}
        className="flex items-start gap-4 rounded-2xl border border-line bg-card p-4 shadow-card transition-shadow hover:shadow-lift focus-visible:outline-3 focus-visible:outline-info"
      >
        <FigureRow ids={research.figureIds} size={40} />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-xl font-semibold">{title}</span>
          {research.title && <span className="block truncate text-ink-2">{research.question}</span>}
          <span className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-3">
            <span>
              {formatShortDate(Date.parse(research.createdAt))} · {figureNames(research.figureIds)}
            </span>
            {forms.length > 0 && (
              <span>
                · {tr.library.madeInto} {forms.join(', ').toLowerCase()}
              </span>
            )}
            <StatusPill phase={phaseOf(research)} />
          </span>
        </span>
      </Link>
    </li>
  );
}

/** Je onderzoeken (keuze 10d): een eigen bibliotheek, nieuwste eerst. */
export function ResearchLibraryPage() {
  useDocumentTitle(tr.library.title);
  const researches = useResearchStore((s) => s.researches);
  const profile = useProfileStore((s) => s.profile);
  const keys = usePodcastKeys();
  const now = useNow(60_000);
  useActiveWork();
  const limit = LIMITS.research.perDay[profile.tier];
  const left = remainingOn(profile.usageByDate, profile.tier, 'research', localDateKey(now));

  return (
    <div className="mx-auto max-w-3xl">
      <BackToDiscover />
      <PageHeader
        title={tr.library.title}
        intro={tr.library.intro}
        actions={
          keys.claude && (
            <ButtonLink to="/onderzoek/nieuw" icon={<Plus aria-hidden className="size-4" />}>
              {tr.library.new}
            </ButtonLink>
          )
        }
      />
      <p className="mb-6 flex flex-wrap items-center gap-2 text-ink-2">
        <Pill tone="gold">{tr.library.perDay(limit)}</Pill>
        {tr.library.today(left, limit)}
      </p>
      {researches.length === 0 ? (
        <EmptyState
          icon={<FileSearch aria-hidden className="size-8" />}
          title={tr.library.empty}
          action={
            <ButtonLink to="/onderzoek/nieuw" icon={<Plus aria-hidden className="size-4" />}>
              {tr.library.new}
            </ButtonLink>
          }
        >
          {keys.claude ? tr.library.emptyHint : tr.problems.sleutel}
        </EmptyState>
      ) : (
        <ul className="space-y-3">
          {researches.map((research) => (
            <ResearchRow key={research.id} research={research} />
          ))}
        </ul>
      )}
    </div>
  );
}
