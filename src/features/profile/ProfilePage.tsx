import { AudioLines, CalendarClock, Library, ShieldCheck } from 'lucide-react';
import { PageHeader, SectionTitle } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useNow } from '@/hooks/useNow';
import { t } from '@/i18n/nl';
import { useSettingsStore } from '@/store/settingsStore';
import {
  AiSourceSection,
  DataSection,
  PreferencesSection,
  TaskModelsSection,
  UsageSection,
} from './settingsParts';
import { FollowingCard, LinkCard, StatsCard, StatusCard, TodayCard } from './statusParts';

/** Profiel (§7.7): status, vandaag, statistieken, overzichten en instellingen. */
export function ProfilePage() {
  useDocumentTitle(t.profile.title);
  const now = useNow(60_000);
  const ownKey = useSettingsStore((s) => s.settings.aiSource === 'anthropic-browser');
  const moderator = useSettingsStore((s) => s.settings.moderatorMode);
  return (
    <>
      <PageHeader title={t.profile.title} intro={t.profile.intro} />
      <div className="grid gap-4 lg:grid-cols-2">
        <StatusCard />
        <div className="space-y-4">
          <TodayCard now={now} />
          <StatsCard />
        </div>
      </div>

      <section aria-labelledby="overzichten" className="mt-10">
        <SectionTitle id="overzichten">{t.profile.overviews}</SectionTitle>
        <div className="grid gap-3 lg:grid-cols-2">
          <LinkCard
            to="/sessies"
            icon={CalendarClock}
            title={t.profile.sessionsHistory}
            body={t.sessions.intro}
          />
          <LinkCard
            to="/colleges"
            icon={Library}
            title={t.profile.myLectures}
            body={t.lectures.intro}
          />
        </div>
        <div className="mt-3">
          <FollowingCard />
        </div>
      </section>

      <section aria-labelledby="instellingen" className="mt-10">
        <SectionTitle id="instellingen">{t.profile.settings}</SectionTitle>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <AiSourceSection />
            {ownKey && <TaskModelsSection />}
            <PreferencesSection />
          </div>
          <div className="space-y-4">
            <LinkCard
              to="/profiel/stem"
              icon={AudioLines}
              title={t.profile.voiceCard}
              body={t.profile.voiceCardHint}
              badge="Proef"
            />
            <LinkCard
              to="/moderatie"
              icon={ShieldCheck}
              title={t.profile.moderationCard}
              body={t.profile.moderationCardHint}
              badge={moderator ? 'Aan' : undefined}
            />
            {ownKey && <UsageSection />}
            <DataSection />
          </div>
        </div>
      </section>
    </>
  );
}
