/**
 * Klaarzetten voor bellen: de agent in het ElevenLabs-account (aanmaken, terugvinden of
 * bijwerken), de stem per denker (ontwerpen en bewaren), het tegoed en de kosten na een gesprek.
 */
import { VOICE } from '@/config/voice';
import type { Figure } from '@/data/types';
import type { VoiceSpec } from '@/data/voices';
import type { CallCost } from '@/store/schemas';
import { useVoiceStore } from '@/store/voiceStore';
import { agentPayload } from './agentConfig';
import { type ElevenLabsApi, type SubscriptionInfo, VoiceApiError, type VoicePreview } from './api';

/**
 * Zorgt dat de agent bestaat en de huidige configuratie heeft. Weigert ElevenLabs de volledige
 * configuratie, dan valt de app terug op de minimale (privacy en rol blijven gelijk).
 */
export async function ensureAgent(api: ElevenLabsApi): Promise<string> {
  const store = useVoiceStore.getState();
  let agentId = store.agent?.id;
  if (agentId && !(await api.agentExists(agentId))) {
    agentId = undefined;
    store.clearAgent();
  }
  const current = useVoiceStore.getState().agent;
  if (agentId && current?.configVersion === VOICE.agentConfigVersion) return agentId;

  agentId ??= await api.findAgentId();
  const existing = agentId;
  const write = async (payload: object): Promise<string> => {
    if (existing) {
      await api.updateAgent(existing, payload);
      return existing;
    }
    return api.createAgent(payload);
  };

  let minimal = false;
  let id: string;
  try {
    id = await write(agentPayload());
  } catch (error) {
    if (!(error instanceof VoiceApiError && error.kind === 'invalid')) throw error;
    minimal = true;
    id = await write(agentPayload({ minimal: true }));
  }
  useVoiceStore.getState().setAgent({ id, configVersion: VOICE.agentConfigVersion, minimal });
  return id;
}

/** Vaste seed per denker: dezelfde beschrijving geeft dan dezelfde eerste voorbeelden. */
export function seedFor(id: string): number {
  let hash = 0x811c9dc5;
  for (const char of id) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0) % 2_147_483_647;
}

export function voiceName(figure: Pick<Figure, 'name'>): string {
  return `Oudiency · ${figure.name}`;
}

/**
 * Drie stemvoorbeelden. De eerste ronde is herhaalbaar; "andere voorbeelden" kiest een nieuwe seed.
 * Accepteert het account het v3-stemontwerp niet, dan proberen we het oudere model.
 */
export async function designPreviews(
  api: ElevenLabsApi,
  figure: Pick<Figure, 'id'>,
  spec: VoiceSpec,
  round: number,
  signal?: AbortSignal,
): Promise<VoicePreview[]> {
  const seed = (seedFor(figure.id) + round * 7919) % 2_147_483_647;
  const input = { description: spec.design, text: spec.sample, seed, signal };
  try {
    return await api.designVoice(input);
  } catch (error) {
    if (!(error instanceof VoiceApiError && error.kind === 'invalid')) throw error;
    return api.designVoice({ ...input, model: VOICE.voiceDesignFallbackModel });
  }
}

/**
 * Bewaart het gekozen voorbeeld als stem van de denker. Een eerder door Oudiency gemaakte stem
 * voor deze denker wordt daarna uit het account verwijderd, zodat er geen stemplek blijft hangen.
 */
export async function saveVoice(
  api: ElevenLabsApi,
  figure: Pick<Figure, 'id' | 'name'>,
  spec: VoiceSpec,
  chosen: VoicePreview,
  previews: readonly VoicePreview[],
): Promise<string> {
  const previous = useVoiceStore.getState().voices[figure.id];
  const voiceId = await api.createVoice({
    name: voiceName(figure),
    description: spec.design,
    generatedVoiceId: chosen.generatedVoiceId,
    notSelected: previews
      .filter((p) => p.generatedVoiceId !== chosen.generatedVoiceId)
      .map((p) => p.generatedVoiceId),
  });
  useVoiceStore.getState().setVoice(figure.id, voiceId);
  if (previous && previous.voiceId !== voiceId) {
    try {
      await api.deleteVoice(previous.voiceId);
    } catch {
      // niet erg: de oude stem staat dan nog in het account
    }
  }
  return voiceId;
}

/** Bestaat de bewaarde stem nog in het account? Zo niet, dan vergeten we hem. */
export async function verifyVoice(
  api: ElevenLabsApi,
  figureId: string,
): Promise<string | undefined> {
  const entry = useVoiceStore.getState().voices[figureId];
  if (!entry) return undefined;
  if (await api.voiceExists(entry.voiceId)) return entry.voiceId;
  useVoiceStore.getState().removeVoice(figureId);
  return undefined;
}

export async function refreshAccount(api: ElevenLabsApi): Promise<SubscriptionInfo> {
  const info = await api.subscription();
  useVoiceStore.getState().setAccount({
    tier: info.tier,
    creditsUsed: info.creditsUsed,
    creditLimit: info.creditLimit,
    resetsAt: info.resetsAt,
    currency: info.currency,
  });
  return info;
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Kosten van een gesprek. Eerst wat ElevenLabs zelf opgeeft (dat duurt even); lukt dat niet
 * (het gesprek is door de privacy-instelling al gewist), dan het verschil in verbruikt tegoed.
 */
export async function lookUpCallCost(
  api: ElevenLabsApi,
  conversationId: string | undefined,
  creditsBefore: number | undefined,
  delays: readonly number[] = VOICE.costPollDelaysMs,
  sleep: (ms: number) => Promise<void> = wait,
): Promise<CallCost | undefined> {
  let latest: CallCost | undefined;
  if (conversationId) {
    for (const delay of delays) {
      await sleep(delay);
      try {
        const cost = await api.conversationCost(conversationId);
        if (cost.credits !== undefined || cost.fiat !== undefined) {
          latest = { credits: cost.credits, fiat: cost.fiat, source: 'gesprek' };
          if (cost.status === 'done') return latest;
        }
      } catch (error) {
        if (error instanceof VoiceApiError && error.kind !== 'rate' && error.kind !== 'server') {
          break;
        }
      }
    }
  }
  if (latest) return latest;
  if (creditsBefore === undefined) return undefined;
  try {
    const info = await refreshAccount(api);
    const used = info.creditsUsed - creditsBefore;
    return used > 0 ? { credits: used, source: 'tegoed' } : undefined;
  } catch {
    return undefined;
  }
}
