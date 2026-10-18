import { ChevronRight, type LucideIcon } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router';
import { Avatar } from '@/components/Avatar';
import { Pill } from '@/components/Badges';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField, Toggle } from '@/components/Field';
import { toast } from '@/components/toastStore';
import { findMeta, TOTAL_FIGURES } from '@/data/figures';
import { discoveredSet } from '@/features/figures/discovery';
import { t } from '@/i18n/nl';
import { localDateKey } from '@/lib/dates';
import { dailyLimit, usedOn } from '@/services/limits.service';
import { useLectureStore } from '@/store/lectureStore';
import { useLibraryStore } from '@/store/miscStores';
import { usePostStore } from '@/store/postStore';
import { useProfileStore } from '@/store/profileStore';
import { useSessionStore } from '@/store/sessionStore';

/** Weergavenaam, Basis of Premium (proef) en credits. */
export function StatusCard() {
  const profile = useProfileStore((s) => s.profile);
  const setDisplayName = useProfileStore((s) => s.setDisplayName);
  const setTier = useProfileStore((s) => s.setTier);
  const [name, setName] = useState(profile.displayName);
  return (
    <Card as="section" aria-labelledby="status">
      <h2 id="status" className="text-2xl">
        {t.profile.tier}
      </h2>
      <form
        className="mt-3 flex flex-wrap items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          setDisplayName(name);
          toast(t.profile.nameSaved, 'ok');
        }}
      >
        <TextField
          className="min-w-0 flex-1"
          label={t.profile.displayName}
          hint={t.profile.nameHint}
          placeholder={t.profile.displayNamePlaceholder}
          maxLength={40}
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Button
          type="submit"
          variant="secondary"
          className="mb-6"
          disabled={name.trim() === profile.displayName}
        >
          {t.timeline.save}
        </Button>
      </form>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Pill tone={profile.tier === 'premium' ? 'gold' : 'neutral'}>
          {profile.tier === 'premium' ? t.profile.premium : t.profile.basis}
        </Pill>
        <Pill tone="figure">
          {t.profile.credits}: {profile.credits}
        </Pill>
      </div>
      <Toggle
        label={t.profile.simulatePremium}
        description={t.profile.premiumHint}
        checked={profile.tier === 'premium'}
        onChange={(on) => setTier(on ? 'premium' : 'basis')}
      />
      <p className="text-sm text-ink-3">{t.profile.creditsHint}</p>
    </Card>
  );
}

/** Vandaag: sessies, colleges en onderzoeken x/y. */
export function TodayCard({ now }: { now: number }) {
  const profile = useProfileStore((s) => s.profile);
  const day = localDateKey(now);
  const sessions = usedOn(profile.usageByDate, 'sessions', day);
  const lectures = usedOn(profile.usageByDate, 'lectures', day);
  const research = usedOn(profile.usageByDate, 'research', day);
  return (
    <Card as="section" aria-labelledby="vandaag">
      <h2 id="vandaag" className="text-2xl">
        {t.profile.today}
      </h2>
      <ul className="mt-2 space-y-1">
        <li>{t.profile.todaySessions(sessions, dailyLimit('sessions', profile.tier))}</li>
        <li>{t.profile.todayLectures(lectures, dailyLimit('lectures', profile.tier))}</li>
        <li>{t.profile.todayResearch(research, dailyLimit('research', profile.tier))}</li>
      </ul>
      <p className="mt-2 text-sm text-ink-3">{t.profile.resetsAtMidnight}</p>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-paper-2 px-3 py-2">
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="font-display text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  );
}

/** Statistieken: gesprekken, colleges gevolgd en gemaakt, ontdekte denkers, berichten. */
export function StatsCard() {
  const sessions = useSessionStore((s) => s.sessions);
  const lectures = useLectureStore((s) => s.lectures);
  const watched = useLibraryStore((s) => s.watched);
  const discovered = useProfileStore((s) => s.profile.discovered);
  const posts = usePostStore((s) => s.posts);
  const done = sessions.filter((s) => s.status === 'afgerond').length;
  const followed = Object.values(watched).filter((w) => w.completedAt).length;
  const made = lectures.filter((l) => l.status === 'afgerond').length;
  return (
    <Card as="section" aria-labelledby="statistieken">
      <h2 id="statistieken" className="text-2xl">
        {t.profile.statistics}
      </h2>
      <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        <Stat label={t.profile.stats.sessions} value={done} />
        <Stat label={t.profile.stats.lecturesWatched} value={followed} />
        <Stat label={t.profile.stats.lecturesMade} value={made} />
        <Stat
          label={t.profile.stats.discovered}
          value={`${discoveredSet(discovered).size} / ${TOTAL_FIGURES}`}
        />
        <Stat label={t.profile.stats.posts} value={posts.length} />
      </dl>
    </Card>
  );
}

/** Gevolgde denkers, met een link naar hun profiel. */
export function FollowingCard() {
  const follows = useProfileStore((s) => s.profile.follows);
  const metas = follows.map((id) => findMeta(id)).filter((m) => m !== undefined);
  return (
    <Card as="section" aria-labelledby="gevolgd">
      <h2 id="gevolgd" className="text-2xl">
        {t.profile.following}
      </h2>
      {metas.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-2">
          {metas.map((meta) => (
            <li key={meta.id}>
              <Link
                to={`/denkers/${meta.id}`}
                className="flex items-center gap-2 rounded-full border border-line bg-paper py-1 pr-3 pl-1 text-sm hover:bg-paper-2 focus-visible:outline-3 focus-visible:outline-info"
              >
                <Avatar figure={meta} size={28} />
                {meta.shortName ?? meta.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-ink-3">{t.profile.noFollowing}</p>
      )}
    </Card>
  );
}

/** Een link-kaart naar een ander overzicht of onderdeel. */
export function LinkCard({
  to,
  icon: Icon,
  title,
  body,
  badge,
}: {
  to: string;
  icon: LucideIcon;
  title: string;
  body: string;
  badge?: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-4 rounded-2xl border border-line bg-card p-4 shadow-card transition-shadow hover:shadow-lift focus-visible:outline-3 focus-visible:outline-info"
    >
      <Icon aria-hidden className="size-8 shrink-0 text-gold" />
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2 font-display text-xl font-semibold">
          {title}
          {badge && <Pill tone="gold">{badge}</Pill>}
        </span>
        <span className="block text-ink-2">{body}</span>
      </span>
      <ChevronRight
        aria-hidden
        className="size-5 text-ink-3 transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
