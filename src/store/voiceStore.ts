/**
 * Bellen: welke agent en stemmen er in het ElevenLabs-account staan, de laatste proefgesprekken
 * en het tegoed. De ElevenLabs-sleutel staat hier bewust niet in (zie settingsStore).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VOICE } from '@/config/voice';
import { clock } from '@/lib/clock';
import { persistOptions, registerStore } from './persist';
import { type CallCost, type TrialCall, type VoiceState, VoiceStateSchema } from './schemas';

interface VoiceStoreState extends VoiceState {
  setAgent: (agent: { id: string; configVersion: number; minimal?: boolean }) => void;
  clearAgent: () => void;
  setVoice: (figureId: string, voiceId: string) => void;
  removeVoice: (figureId: string) => void;
  /** "Andere stem": deze stem voor deze spreker, overal. */
  setOverride: (speaker: string, voiceId: string, name?: string) => void;
  /** Terug naar automatisch (of de ontworpen stem). */
  clearOverride: (speaker: string) => void;
  addTrial: (trial: TrialCall) => void;
  setTrialCost: (id: string, cost: CallCost) => void;
  clearTrials: () => void;
  setAccount: (account: Omit<NonNullable<VoiceState['account']>, 'checkedAt'>) => void;
  /**
   * Na het wissen van de sleutel: alleen de accountgegevens vergeten. Agent en stemmen blijven
   * bewaard (dezelfde sleutel opnieuw invoeren kost dan niets); vóór elk gesprek controleert de
   * app of ze nog bestaan.
   */
  clearAccount: () => void;
}

export function initialVoiceState(): VoiceState {
  return { agent: undefined, voices: {}, overrides: {}, trials: [], account: undefined };
}

export const useVoiceStore = create<VoiceStoreState>()(
  persist(
    (set) => ({
      ...initialVoiceState(),
      setAgent: (agent) => set({ agent: { ...agent, updatedAt: clock.iso() } }),
      clearAgent: () => set({ agent: undefined }),
      setVoice: (figureId, voiceId) =>
        set((s) => {
          // Een nieuw ontworpen stem is een bewuste keuze: die gaat dan weer voor.
          const overrides = { ...s.overrides };
          delete overrides[figureId];
          return {
            voices: { ...s.voices, [figureId]: { voiceId, createdAt: clock.iso() } },
            overrides,
          };
        }),
      setOverride: (speaker, voiceId, name) =>
        set((s) => ({
          overrides: {
            ...s.overrides,
            [speaker]: { voiceId, ...(name ? { name } : {}), updatedAt: clock.iso() },
          },
        })),
      clearOverride: (speaker) =>
        set((s) => {
          const overrides = { ...s.overrides };
          delete overrides[speaker];
          return { overrides };
        }),
      removeVoice: (figureId) =>
        set((s) => {
          const voices = { ...s.voices };
          delete voices[figureId];
          return { voices };
        }),
      addTrial: (trial) =>
        set((s) => ({
          trials: [trial, ...s.trials.filter((t) => t.id !== trial.id)].slice(
            0,
            VOICE.trialHistory,
          ),
        })),
      setTrialCost: (id, cost) =>
        set((s) => ({ trials: s.trials.map((t) => (t.id === id ? { ...t, cost } : t)) })),
      clearTrials: () => set({ trials: [] }),
      setAccount: (account) => set({ account: { ...account, checkedAt: clock.iso() } }),
      clearAccount: () => set({ account: undefined }),
    }),
    persistOptions<VoiceStoreState, VoiceState>({
      name: 'voice',
      version: 1,
      schema: VoiceStateSchema,
      partialize: (s) => ({
        agent: s.agent,
        voices: s.voices,
        overrides: s.overrides,
        trials: s.trials,
        account: s.account,
      }),
    }),
  ),
);

registerStore({
  name: 'voice',
  version: 1,
  schema: VoiceStateSchema,
  rehydrate: () => useVoiceStore.persist.rehydrate(),
});
