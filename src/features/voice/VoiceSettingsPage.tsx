import { Info, Wallet } from 'lucide-react';
import { AiLabel } from '@/components/Badges';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { ThemeFrame } from '@/components/ThemeFrame';
import { getMeta } from '@/data/figures';
import { voiceSpecFor } from '@/data/voices';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tv } from '@/i18n/voice';
import { AgentCard, KeyCard, TrialCard, TrialHistory, VoiceDesignCard } from './settingsParts';

/** De denker van de spraakproef. */
const TRIAL_FIGURE_ID = 'socrates';

export function VoiceSettingsPage() {
  useDocumentTitle(tv.settings.title);
  const meta = getMeta(TRIAL_FIGURE_ID);
  const spec = voiceSpecFor(TRIAL_FIGURE_ID);

  return (
    <>
      <PageHeader
        eyebrow={tv.settings.eyebrow}
        title={tv.settings.title}
        intro={tv.settings.intro}
        actions={<AiLabel />}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <ThemeFrame figure={meta} className="min-w-0 space-y-6">
          <KeyCard />
          <AgentCard />
          {spec && <VoiceDesignCard meta={meta} spec={spec} />}
          <TrialCard meta={meta} />
          <TrialHistory />
        </ThemeFrame>
        <aside className="space-y-6" aria-label="Uitleg">
          <Card as="section" aria-labelledby="hoe">
            <h2 id="hoe" className="mb-2 flex items-center gap-2 text-xl">
              <Info aria-hidden className="size-5 text-info" />
              {tv.settings.howTitle}
            </h2>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-2">
              {tv.settings.how.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Card>
          <Card as="section" aria-labelledby="kosten">
            <h2 id="kosten" className="mb-2 flex items-center gap-2 text-xl">
              <Wallet aria-hidden className="size-5 text-gold" />
              {tv.settings.costTitle}
            </h2>
            <p className="text-sm text-ink-2">{tv.settings.cost}</p>
          </Card>
        </aside>
      </div>
    </>
  );
}
