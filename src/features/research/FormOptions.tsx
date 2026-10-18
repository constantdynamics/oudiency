import { ChoiceChips } from '@/components/Chips';
import { PODCAST } from '@/config/podcast';
import type { EssayLength, ResearchForm } from '@/config/research';
import { findMeta } from '@/data/figures';
import { tp } from '@/i18n/podcast';
import { tr } from '@/i18n/research';
import { formatEur } from '@/podcast/costs';
import { type CostLine, totalEur } from '@/research/estimate';
import { type FormDraft, podcastFormats } from '@/services/research.service';
import type { PodcastFormat } from '@/store/schemas';
import { figureNames } from './format';

function Choice<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: readonly { value: T; label: string }[];
}) {
  return (
    <div>
      <p className="mb-1.5 font-medium">{label}</p>
      <ChoiceChips<T> label={label} value={value} onChange={onChange} options={options} />
    </div>
  );
}

/** Kies één van de denkers (de schrijver, de hoofddocent, wie je belt). */
function FigureChoice({
  label,
  figureIds,
  value,
  onChange,
}: {
  label: string;
  figureIds: readonly string[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (figureIds.length < 2) return null;
  return (
    <Choice
      label={label}
      value={value}
      onChange={onChange}
      options={figureIds.map((id) => ({ value: id, label: findMeta(id)?.name ?? id }))}
    />
  );
}

const LENGTHS: readonly EssayLength[] = ['kort', 'lang'];

/** Wat er van het onderzoek gemaakt wordt, met de keuzes die bij die vorm horen. */
export function FormOptions({
  figureIds,
  draft,
  onChange,
  forms,
  hasVoiceKey,
}: {
  figureIds: readonly string[];
  draft: FormDraft;
  onChange: (draft: FormDraft) => void;
  forms: readonly ResearchForm[];
  hasVoiceKey: boolean;
}) {
  const who = draft.figureId && figureIds.includes(draft.figureId) ? draft.figureId : figureIds[0];
  const set = (patch: Partial<FormDraft>) => onChange({ ...draft, ...patch });
  const formats = podcastFormats(figureIds.length);
  const podcastFormat =
    draft.podcastFormat && formats.includes(draft.podcastFormat) ? draft.podcastFormat : formats[0];

  return (
    <div className="space-y-4">
      <div>
        <ChoiceChips<ResearchForm>
          label={tr.form.formTitle}
          value={draft.form}
          onChange={(form) => set({ form })}
          options={forms.map((form) => ({ value: form, label: tr.forms[form] }))}
        />
        <p className="mt-2 text-sm text-ink-3">{tr.formHints[draft.form]}</p>
      </div>

      {draft.form === 'tekst' && who && (
        <>
          <FigureChoice
            label={tr.form.writer}
            figureIds={figureIds}
            value={who}
            onChange={(figureId) => set({ figureId })}
          />
          <Choice<EssayLength>
            label={tr.form.length}
            value={draft.length}
            onChange={(length) => set({ length })}
            options={LENGTHS.map((value) => ({ value, label: tr.lengths[value] }))}
          />
        </>
      )}

      {draft.form === 'podcast' && podcastFormat && (
        <>
          {formats.length > 1 ? (
            <Choice<PodcastFormat>
              label={tr.form.podcastFormat}
              value={podcastFormat}
              onChange={(next) => set({ podcastFormat: next })}
              options={formats.map((value) => ({ value, label: tp.formats[value] }))}
            />
          ) : (
            <p className="text-ink-2">{tr.form.panelPodcast(figureNames(figureIds))}</p>
          )}
          <Choice<string>
            label={tr.form.length}
            value={String(draft.minutes)}
            onChange={(value) => set({ minutes: Number(value) })}
            options={PODCAST.lengths.map((value) => ({
              value: String(value),
              label: tp.meta.minutes(value),
            }))}
          />
        </>
      )}

      {draft.form === 'college' && who && (
        <>
          <FigureChoice
            label={tr.form.lecturer}
            figureIds={figureIds}
            value={who}
            onChange={(figureId) => set({ figureId })}
          />
          {figureIds.length > 1 && (
            <p className="text-sm text-ink-3">
              {tr.form.guests(figureNames(figureIds.filter((id) => id !== who)))}
            </p>
          )}
        </>
      )}

      {draft.form === 'bellen' && who && (
        <>
          <FigureChoice
            label={tr.form.callee}
            figureIds={figureIds}
            value={who}
            onChange={(figureId) => set({ figureId })}
          />
          {!hasVoiceKey && <p className="text-sm text-warn">{tr.problems.stemsleutel}</p>}
        </>
      )}
    </div>
  );
}

/** De kosten per onderdeel en samen, in euro's (keuze 10a). */
export function CostSummary({ lines }: { lines: readonly CostLine[] }) {
  return (
    <div className="rounded-2xl bg-paper-2 px-4 py-3">
      <p className="font-medium">{tr.form.estimate}</p>
      <ul className="mt-1 space-y-0.5 text-ink-2">
        {lines.map((line) => (
          <li key={line.key}>
            {tr.form.costLine(tr.costs[line.key], formatEur(line.eur), line.service)}
          </li>
        ))}
      </ul>
      {lines.length > 1 && (
        <p className="mt-1 font-medium">{tr.form.total(formatEur(totalEur(lines)))}</p>
      )}
      <p className="mt-2 text-sm text-ink-3">{tr.form.estimateNote}</p>
    </div>
  );
}
