/**
 * Kostenschattingen in euro's (keuze 10a), op basis van de indicatieve API-prijzen van Claude en
 * ElevenLabs. Met een ElevenLabs-abonnement betaal je in credits; dan is dit een indicatie.
 */
import { PODCAST, ttsModelInfo } from '@/config/podcast';
import { DEFAULT_TASK_MODELS, PRICES_PER_MTOK, type AiTask } from '@/config/models';

/** Tekens voor een stuk gesproken tekst van zoveel minuten. */
export function charsForMinutes(minutes: number): number {
  return Math.round(minutes * PODCAST.wordsPerMinute * PODCAST.charsPerWord);
}

/** Voorlezen bij ElevenLabs. */
export function ttsEur(chars: number, model: string | undefined): number {
  return (chars / 1000) * ttsModelInfo(model).usdPer1kChars * PODCAST.usdToEur;
}

/** Een aanroep van Claude (invoer en uitvoer in tokens, denken telt mee als uitvoer). */
export function claudeEur(
  task: AiTask,
  inputTokens: number,
  outputTokens: number,
  model = DEFAULT_TASK_MODELS[task].model,
): number {
  const price = PRICES_PER_MTOK[model];
  if (!price) return 0;
  const usd = (inputTokens * price.input + outputTokens * price.output) / 1_000_000;
  return usd * PODCAST.usdToEur;
}

/** Een aflevering schrijven: vaste rol en regels erin, het script (en wat denkwerk) eruit. */
export function scriptEur(minutes: number, figures: number): number {
  const input = 3_000 + figures * 2_500;
  const output = Math.round(minutes * PODCAST.wordsPerMinute * 1.6) + 2_000;
  return claudeEur('podcast', input, output);
}

/** € 0,04 — met minstens één cent, zodat "gratis" nooit verkeerd wordt gelezen. */
export function formatEur(amount: number): string {
  const value = Math.max(0.01, amount);
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
