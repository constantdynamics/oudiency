import { Check, Info, Wallet } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { AiLabel } from '@/components/Badges';
import { ChoiceChips } from '@/components/Chips';
import { Card } from '@/components/Card';
import { PageHeader } from '@/components/PageHeader';
import { ThemeFrame } from '@/components/ThemeFrame';
import { CORE_META, getMeta } from '@/data/figures';
import { CORE_VOICES, voiceSpecFor } from '@/data/voices';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { tv } from '@/i18n/voice';
import { useVoiceStore } from '@/store/voiceStore';
import { AgentCard, KeyCard, TrialCard, TrialHistory, VoiceDesignCard } from './settingsParts';

/** Standaard: de denker van de spraakproef. */
const DEFAULT_FIGURE_ID = 'socrates';

/** De kerndenkers met een stem; ?denker=kant opent die van Kant. */
const VOICE_FIGURES = CORE_META.filter((meta) => CORE_VOICES[meta.id]);

export function VoiceSettingsPage() {
  useDocumentTitle(tv.settings.title);
  const [params, setParams] = useSearchParams();
  const requested = params.get('denker');
  const figureId = requested && CORE_VOICES[requested] ? requested : DEFAULT_FIGURE_ID;
  const meta = getMeta(figureId);
  const spec = voiceSpecFor(figureId);
  const voices = useVoiceStore((s) => s.voices);

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
          <ChoiceChips<string>
            label={tv.settings.figuresLabel}
            value={figureId}
            onChange={(value) => setParams({ denker: value }, { replace: true })}
            options={VOICE_FIGURES.map((figure) => ({
              value: figure.id,
              label: (
                <>
                  {figure.shortName ?? figure.name}
                  {voices[figure.id] && (
                    <Check aria-label={tv.settings.hasVoice} className="size-3.5" />
                  )}
                </>
              ),
            }))}
          />
          {spec && <VoiceDesignCard key={meta.id} meta={meta} spec={spec} />}
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
