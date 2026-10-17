/**
 * Demomodus (§8.8): vooraf geschreven, in-karakter fragmenten met een gesimuleerde typesnelheid.
 * Iedereen kan de site op GitHub Pages zo direct ervaren, zonder API-key.
 */
import { useSettingsStore } from '@/store/settingsStore';
import { composeStructured, composeText } from './demo/compose';
import {
  AiError,
  type AIProvider,
  type StructuredRequest,
  type TextRequest,
  type TextResult,
} from './provider';

function instant(): boolean {
  return useSettingsStore.getState().settings.devInstantReactions;
}

/** Geen gesprek, dus geen typetijd: de gedachte van vandaag staat er meteen (een briefje). */
const WITHOUT_TYPING: ReadonlySet<TextRequest['demo']['kind']> = new Set(['thought']);

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new AiError('aborted', 'Afgebroken.'));
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(new AiError('aborted', 'Afgebroken.'));
      },
      { once: true },
    );
  });
}

export class DemoProvider implements AIProvider {
  readonly id = 'demo' as const;

  async streamText(
    req: TextRequest,
    onDelta: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<TextResult> {
    const text = await composeText(req.demo);
    if (instant() || WITHOUT_TYPING.has(req.demo.kind)) {
      onDelta(text);
      return { text, stopReason: 'end_turn' };
    }
    // Even nadenken, dan woord voor woord "typen".
    await wait(550 + Math.min(900, text.length * 2), signal);
    const tokens = text.match(/\S+\s*/g) ?? [text];
    for (let i = 0; i < tokens.length; i += 2) {
      onDelta(tokens.slice(i, i + 2).join(''));
      await wait(42, signal);
    }
    return { text, stopReason: 'end_turn' };
  }

  async structured<T>(req: StructuredRequest<T>): Promise<T> {
    const value = await composeStructured(req.demo);
    if (!instant()) await wait(450);
    const parsed = req.schema.safeParse(value);
    if (!parsed.success) throw new AiError('invalid', 'De demomodus gaf een onverwacht antwoord.');
    return parsed.data;
  }
}
