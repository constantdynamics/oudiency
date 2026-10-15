/**
 * Modellen per taak (§8.7). Standaardwaarden; aanpasbaar via Profiel → Instellingen → Geavanceerd.
 * Effort blijft binnen één gesprek constant: een wisseling breekt de prompt-cache.
 */

export type AiTask =
  | 'session'
  | 'lecture'
  | 'timelineReactions'
  | 'summary'
  | 'moderation'
  | 'helper'
  | 'thoughtOfTheDay'
  | 'dailyQuestion';

export type Effort = 'low' | 'medium' | 'high';

export interface TaskModelConfig {
  model: string;
  effort: Effort;
  /** Ruimte voor denken én antwoord: denken telt mee in de output. */
  maxTokens: number;
}

export const DEFAULT_TASK_MODELS: Record<AiTask, TaskModelConfig> = {
  session: { model: 'claude-sonnet-5-5', effort: 'low', maxTokens: 8_000 },
  lecture: { model: 'claude-sonnet-5-5', effort: 'medium', maxTokens: 16_000 },
  timelineReactions: { model: 'claude-haiku-5-5', effort: 'low', maxTokens: 4_000 },
  summary: { model: 'claude-haiku-5-5', effort: 'low', maxTokens: 4_000 },
  moderation: { model: 'claude-haiku-5-5', effort: 'low', maxTokens: 2_000 },
  helper: { model: 'claude-haiku-5-5', effort: 'low', maxTokens: 3_000 },
  thoughtOfTheDay: { model: 'claude-haiku-5-5', effort: 'low', maxTokens: 2_000 },
  dailyQuestion: { model: 'claude-haiku-5-5', effort: 'low', maxTokens: 1_500 },
};

export const TASK_LABELS: Record<AiTask, string> = {
  session: 'Sessies',
  lecture: 'Colleges',
  timelineReactions: 'Timeline-reacties',
  summary: 'Samenvattingen',
  moderation: 'Moderatie-precheck',
  helper: '"Wie kan mij helpen?"',
  thoughtOfTheDay: 'Gedachte van vandaag',
  dailyQuestion: 'Dagvraag in stijl',
};

/** Modellen die in de instellingen te kiezen zijn. */
export const SELECTABLE_MODELS = [
  { id: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5' },
  { id: 'claude-haiku-5-5', label: 'Claude Haiku 5.5' },
  { id: 'claude-opus-5-5', label: 'Claude Opus 5.5' },
] as const;

/**
 * Indicatieve prijzen per miljoen tokens (oktober 2026, Claude API).
 * Controleer ze op https://platform.claude.com/docs/en/about-claude/pricing
 * Haiku 5.5: tarief voor prompts tot 100K tokens.
 */
export interface ModelPrice {
  input: number;
  output: number;
  cacheWrite: number;
  cacheRead: number;
}

export const PRICES_PER_MTOK: Record<string, ModelPrice> = {
  'claude-sonnet-5-5': { input: 2, output: 10, cacheWrite: 2.5, cacheRead: 0.2 },
  'claude-haiku-5-5': { input: 0.1, output: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
  'claude-opus-5-5': { input: 4, output: 20, cacheWrite: 5, cacheRead: 0.2 },
};

/**
 * Server-side fallback bij een weigering (refusal). Alleen voor modellen die het
 * ondersteunen op de Claude API; Haiku 5.5 heeft geen server-side fallback.
 */
export const FALLBACK_CAPABLE_MODELS = new Set(['claude-sonnet-5-5', 'claude-opus-5-5']);
export const FALLBACK_BETA = 'server-side-fallback-2026-07-01';
