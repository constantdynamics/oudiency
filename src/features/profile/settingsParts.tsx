import { Download, ExternalLink, KeyRound, RotateCcw, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { AiError } from '@/ai';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Dialog } from '@/components/Dialog';
import { TextField, Toggle } from '@/components/Field';
import { toast } from '@/components/toastStore';
import {
  type AiTask,
  DEFAULT_TASK_MODELS,
  type Effort,
  PRICES_PER_MTOK,
  SELECTABLE_MODELS,
  TASK_LABELS,
} from '@/config/models';
import { t } from '@/i18n/nl';
import { clock } from '@/lib/clock';
import { canSpeak } from '@/lib/speech';
import { useUsageStore } from '@/store/miscStores';
import { apiKeyStorage, maskApiKey, useHasSecret, useSettingsStore } from '@/store/settingsStore';

type KeyState =
  | { status: 'idle' }
  | { status: 'testing' }
  | { status: 'ok' }
  | { status: 'error'; message: string };

/** Een korte, goedkope test-aanroep met de nieuwe sleutel. */
async function testKey(): Promise<void> {
  const { getProvider } = await import('@/ai');
  await getProvider().streamText(
    {
      task: 'dailyQuestion',
      system: [{ text: 'Antwoord met alleen het woord: ok.' }],
      messages: [{ role: 'user', content: 'Test' }],
      demo: { kind: 'test' },
    },
    () => {},
  );
}

/** AI-bron: demomodus of je eigen Anthropic-sleutel (BYOK). */
export function AiSourceSection() {
  const id = useId();
  const aiSource = useSettingsStore((s) => s.settings.aiSource);
  const update = useSettingsStore((s) => s.update);
  const hasKey = useHasSecret(apiKeyStorage);
  const [key, setKey] = useState('');
  const [state, setState] = useState<KeyState>({ status: 'idle' });
  const stored = hasKey ? apiKeyStorage.get() : null;

  const save = async () => {
    const value = key.trim();
    if (!value) return;
    apiKeyStorage.set(value);
    update({ aiSource: 'anthropic-browser' });
    setKey('');
    setState({ status: 'testing' });
    try {
      await testKey();
      setState({ status: 'ok' });
    } catch (error) {
      setState({
        status: 'error',
        message: error instanceof AiError ? error.message : t.errors.generic,
      });
    }
  };

  const clear = () => {
    apiKeyStorage.clear();
    update({ aiSource: 'demo' });
    setState({ status: 'idle' });
    toast(t.profile.keyCleared, 'ok');
  };

  return (
    <Card
      as="section"
      id="ai"
      aria-labelledby={`${id}-titel`}
      className="scroll-mt-[calc(var(--header-h)+1rem)]"
    >
      <h2 id={`${id}-titel`} className="text-2xl">
        {t.profile.aiTitle}
      </h2>
      <fieldset className="mt-3 space-y-2">
        <legend className="sr-only">{t.profile.aiTitle}</legend>
        {(
          [
            ['demo', t.profile.aiDemo, t.profile.aiDemoHint],
            ['anthropic-browser', t.profile.aiOwnKey, t.profile.aiOwnKeyHint],
          ] as const
        ).map(([value, label, hint]) => (
          <label
            key={value}
            className="flex cursor-pointer items-start gap-3 rounded-xl border border-line px-3 py-2.5 has-[:checked]:border-fig has-[:checked]:bg-fig-surface"
          >
            <input
              type="radio"
              name={`${id}-bron`}
              value={value}
              checked={aiSource === value}
              onChange={() => update({ aiSource: value })}
              className="mt-1.5 size-4 accent-[var(--color-ink)]"
            />
            <span>
              <span className="block font-medium">{label}</span>
              <span className="block text-sm text-ink-3">{hint}</span>
            </span>
          </label>
        ))}
      </fieldset>

      {aiSource === 'anthropic-browser' && (
        <div className="mt-4 space-y-3">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-2">
            {t.profile.keySteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <a
            href={t.profile.keysUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 text-sm text-fig underline underline-offset-2"
          >
            <ExternalLink aria-hidden className="size-4" />
            {t.profile.openKeys}
          </a>
          {stored && (
            <p className="flex flex-wrap items-center gap-2 text-sm">
              <KeyRound aria-hidden className="size-4 text-ink-3" />
              {t.profile.storedKey}:{' '}
              <code className="rounded bg-paper-2 px-1.5">{maskApiKey(stored)}</code>
            </p>
          )}
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <TextField
              className="min-w-0 flex-1"
              label={t.profile.keyLabel}
              type="password"
              autoComplete="off"
              spellCheck={false}
              placeholder={t.profile.keyPlaceholder}
              value={key}
              onChange={(event) => setKey(event.target.value)}
            />
            <Button type="submit" disabled={!key.trim() || state.status === 'testing'}>
              {state.status === 'testing' ? t.profile.testing : t.profile.saveAndTest}
            </Button>
          </form>
          <p aria-live="polite" className="text-sm">
            {state.status === 'ok' && <span className="text-ok">{t.profile.keyOk}</span>}
            {state.status === 'error' && <span className="text-danger">{state.message}</span>}
          </p>
          <p className="text-sm text-ink-3">{t.profile.keyPrivacy}</p>
          {stored && (
            <Button
              variant="ghost"
              size="sm"
              icon={<Trash2 aria-hidden className="size-4" />}
              onClick={clear}
            >
              {t.profile.clearKey}
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

const TASKS = Object.keys(TASK_LABELS) as AiTask[];
const EFFORTS: Effort[] = ['low', 'medium', 'high'];
const SELECT =
  'w-full rounded-lg border border-line-strong bg-card px-2 py-1.5 text-sm text-ink focus:border-ink-2 focus:outline-none focus-visible:outline-3 focus-visible:outline-info';

/** Geavanceerd: model en denkniveau per taak (§8.7). */
export function TaskModelsSection() {
  const taskModels = useSettingsStore((s) => s.settings.taskModels);
  const serverFallback = useSettingsStore((s) => s.settings.serverFallback);
  const setTaskModel = useSettingsStore((s) => s.setTaskModel);
  const resetTaskModels = useSettingsStore((s) => s.resetTaskModels);
  const update = useSettingsStore((s) => s.update);
  return (
    <Card as="section" aria-label={t.profile.advanced}>
      <details>
        <summary className="cursor-pointer font-display text-xl font-semibold">
          {t.profile.advanced}
        </summary>
        <p className="mt-2 text-sm text-ink-3">{t.profile.advancedHint}</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] text-sm">
            <thead>
              <tr className="text-left text-ink-3">
                <th scope="col" className="py-1 pr-2 font-medium">
                  {t.profile.usageTask}
                </th>
                <th scope="col" className="py-1 pr-2 font-medium">
                  {t.profile.model}
                </th>
                <th scope="col" className="py-1 font-medium">
                  {t.profile.effort}
                </th>
              </tr>
            </thead>
            <tbody>
              {TASKS.map((task) => {
                const config = taskModels[task] ?? DEFAULT_TASK_MODELS[task];
                return (
                  <tr key={task} className="border-t border-line">
                    <th scope="row" className="py-1.5 pr-2 text-left font-normal">
                      {TASK_LABELS[task]}
                    </th>
                    <td className="py-1.5 pr-2">
                      <select
                        aria-label={`${t.profile.model}: ${TASK_LABELS[task]}`}
                        className={SELECT}
                        value={config.model}
                        onChange={(event) =>
                          setTaskModel(task, { ...config, model: event.target.value })
                        }
                      >
                        {SELECTABLE_MODELS.map((model) => (
                          <option key={model.id} value={model.id}>
                            {model.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-1.5">
                      <select
                        aria-label={`${t.profile.effort}: ${TASK_LABELS[task]}`}
                        className={SELECT}
                        value={config.effort}
                        onChange={(event) =>
                          setTaskModel(task, { ...config, effort: event.target.value as Effort })
                        }
                      >
                        {EFFORTS.map((effort) => (
                          <option key={effort} value={effort}>
                            {t.profile.efforts[effort]}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2"
          icon={<RotateCcw aria-hidden className="size-4" />}
          onClick={resetTaskModels}
        >
          {t.profile.resetModels}
        </Button>
        <Toggle
          label={t.profile.serverFallback}
          description={t.profile.serverFallbackHint}
          checked={serverFallback}
          onChange={(value) => update({ serverFallback: value })}
        />
      </details>
    </Card>
  );
}

/** Meldingen van de browser en voorlezen. */
export function PreferencesSection() {
  const settings = useSettingsStore((s) => s.settings);
  const update = useSettingsStore((s) => s.update);
  const [denied, setDenied] = useState(false);
  const [speechOk] = useState(canSpeak);

  const toggleNotifications = async (value: boolean) => {
    if (!value) {
      update({ browserNotifications: false });
      return;
    }
    if (typeof Notification === 'undefined') {
      setDenied(true);
      return;
    }
    const permission =
      Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
    setDenied(permission !== 'granted');
    update({ browserNotifications: permission === 'granted' });
  };

  return (
    <Card as="section" aria-labelledby="voorkeuren">
      <h2 id="voorkeuren" className="text-2xl">
        {t.profile.notificationsTitle}
      </h2>
      <Toggle
        label={t.profile.browserNotifications}
        description={t.profile.browserNotificationsHint}
        checked={settings.browserNotifications}
        onChange={(value) => void toggleNotifications(value)}
      />
      {denied && (
        <p role="alert" className="text-sm text-danger">
          {t.profile.notificationsDenied}
        </p>
      )}
      <Toggle
        label={t.profile.readingVoice}
        description={speechOk ? t.profile.readingVoiceHint : t.profile.readingVoiceUnavailable}
        checked={settings.readingVoice}
        disabled={!speechOk}
        onChange={(value) => update({ readingVoice: value })}
      />
      <Toggle
        label={t.profile.devPanel}
        description={t.profile.devPanelHint}
        checked={settings.devPanelEnabled}
        onChange={(value) => update({ devPanelEnabled: value })}
      />
    </Card>
  );
}

/** Mijn data: exporteren, importeren en alles wissen. Sleutels gaan nooit mee. */
export function DataSection() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [confirm, setConfirm] = useState(false);
  const [includeKeys, setIncludeKeys] = useState(false);

  const download = async () => {
    const { exportData } = await import('@/store/dataPortability');
    const blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `oudiency-export-${clock.iso().slice(0, 10)}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const upload = async (file: File) => {
    try {
      const { importData } = await import('@/store/dataPortability');
      const result = await importData(await file.text());
      toast(t.profile.imported(result.imported.length), 'ok');
    } catch (error) {
      toast(error instanceof Error ? error.message : t.errors.generic, 'warn');
    }
  };

  const wipe = async () => {
    const { wipeAllData } = await import('@/store/dataPortability');
    wipeAllData({ includeApiKeys: includeKeys });
    setConfirm(false);
    toast(t.profile.wiped, 'ok');
    window.location.reload();
  };

  return (
    <Card as="section" aria-labelledby="mijn-data">
      <h2 id="mijn-data" className="text-2xl">
        {t.profile.myData}
      </h2>
      <div className="mt-3 space-y-4">
        <div>
          <h3 className="font-semibold">{t.profile.exportTitle}</h3>
          <p className="text-sm text-ink-3">{t.profile.exportHint}</p>
          <Button
            variant="secondary"
            size="sm"
            className="mt-2"
            icon={<Download aria-hidden className="size-4" />}
            onClick={() => void download()}
          >
            {t.profile.exportButton}
          </Button>
        </div>
        <div>
          <h3 className="font-semibold">{t.profile.importTitle}</h3>
          <p className="text-sm text-ink-3">{t.profile.importHint}</p>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = '';
            }}
          />
          <Button
            variant="secondary"
            size="sm"
            className="mt-2"
            icon={<Upload aria-hidden className="size-4" />}
            onClick={() => fileRef.current?.click()}
          >
            {t.profile.importButton}
          </Button>
        </div>
        <div>
          <h3 className="font-semibold">{t.profile.wipeTitle}</h3>
          <p className="text-sm text-ink-3">{t.profile.wipeHint}</p>
          <Button
            variant="danger"
            size="sm"
            className="mt-2"
            icon={<Trash2 aria-hidden className="size-4" />}
            onClick={() => setConfirm(true)}
          >
            {t.profile.wipeButton}
          </Button>
        </div>
      </div>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title={t.profile.wipeTitle}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              {t.app.cancel}
            </Button>
            <Button variant="danger" onClick={() => void wipe()}>
              {t.profile.wipeButton}
            </Button>
          </>
        }
      >
        <p>{t.profile.wipeConfirm}</p>
        <label className="mt-3 flex items-center gap-2">
          <input
            type="checkbox"
            checked={includeKeys}
            onChange={(event) => setIncludeKeys(event.target.checked)}
            className="size-4 accent-[var(--color-danger)]"
          />
          {t.profile.wipeKeys}
        </label>
      </Dialog>
    </Card>
  );
}

function cost(model: string, input: number, output: number, cacheRead: number, cacheWrite: number) {
  const price = PRICES_PER_MTOK[model];
  if (!price) return 0;
  return (
    (input * price.input +
      output * price.output +
      cacheRead * price.cacheRead +
      cacheWrite * price.cacheWrite) /
    1_000_000
  );
}

/** Verbruik (alleen bij je eigen key): per taak, met een schatting van de kosten. */
export function UsageSection() {
  const entries = useUsageStore((s) => s.entries);
  const clear = useUsageStore((s) => s.clear);
  const rows = new Map<string, { calls: number; input: number; output: number; dollars: number }>();
  for (const entry of entries) {
    const row = rows.get(entry.task) ?? { calls: 0, input: 0, output: 0, dollars: 0 };
    row.calls += 1;
    row.input += entry.inputTokens + entry.cacheReadTokens + entry.cacheWriteTokens;
    row.output += entry.outputTokens;
    row.dollars += cost(
      entry.model,
      entry.inputTokens,
      entry.outputTokens,
      entry.cacheReadTokens,
      entry.cacheWriteTokens,
    );
    rows.set(entry.task, row);
  }
  const total = [...rows.values()].reduce((sum, row) => sum + row.dollars, 0);
  const money = (n: number) => `$${n.toFixed(n < 1 ? 3 : 2)}`;
  return (
    <Card as="section" aria-labelledby="verbruik">
      <h2 id="verbruik" className="text-2xl">
        {t.profile.usage}
      </h2>
      <p className="mt-1 text-sm text-ink-3">{t.profile.usageIntro}</p>
      {rows.size === 0 ? (
        <p className="mt-2 text-ink-3">{t.profile.usageEmpty}</p>
      ) : (
        <>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[26rem] text-sm">
              <thead>
                <tr className="text-left text-ink-3">
                  <th scope="col" className="py-1 pr-2 font-medium">
                    {t.profile.usageTask}
                  </th>
                  <th scope="col" className="py-1 pr-2 text-right font-medium">
                    {t.profile.usageCalls}
                  </th>
                  <th scope="col" className="py-1 pr-2 text-right font-medium">
                    {t.profile.usageTokens}
                  </th>
                  <th scope="col" className="py-1 text-right font-medium">
                    {t.profile.usageCost}
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...rows.entries()].map(([task, row]) => (
                  <tr key={task} className="border-t border-line tabular-nums">
                    <th scope="row" className="py-1.5 pr-2 text-left font-normal">
                      {TASK_LABELS[task as AiTask] ?? task}
                    </th>
                    <td className="py-1.5 pr-2 text-right">{row.calls}</td>
                    <td className="py-1.5 pr-2 text-right">
                      {row.input.toLocaleString('nl-NL')} / {row.output.toLocaleString('nl-NL')}
                    </td>
                    <td className="py-1.5 text-right">{money(row.dollars)}</td>
                  </tr>
                ))}
                <tr className="border-t border-line-strong font-semibold tabular-nums">
                  <th scope="row" className="py-1.5 pr-2 text-left">
                    {t.profile.usageTotal}
                  </th>
                  <td />
                  <td />
                  <td className="py-1.5 text-right">{money(total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Button variant="ghost" size="sm" className="mt-2" onClick={clear}>
            {t.profile.usageClear}
          </Button>
        </>
      )}
    </Card>
  );
}
