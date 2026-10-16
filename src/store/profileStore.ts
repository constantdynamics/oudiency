import * as z from 'zod/mini';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { LIMITS, type Tier } from '@/config/limits';
import { clock } from '@/lib/clock';
import { localDateKey } from '@/lib/dates';
import { consume, type LimitKind, pruneUsage, release, resetDay } from '@/services/limits.service';
import { persistOptions, registerStore } from './persist';
import { UserProfileSchema, type UserProfile } from './schemas';

interface ProfileState {
  profile: UserProfile;
  setDisplayName: (name: string) => void;
  setTier: (tier: Tier) => void;
  addCredits: (amount: number) => void;
  /** Geeft false terug als er niet genoeg credits zijn. */
  spendCredits: (amount: number) => boolean;
  toggleFollow: (figureId: string) => void;
  /** Markeer als ontdekt; geeft true als de denker nieuw ontdekt is. */
  discover: (figureId: string) => boolean;
  /** Verbruik een dagplek; gooit LimitError als de limiet bereikt is. */
  consumeUsage: (kind: LimitKind, dateKey: string) => void;
  releaseUsage: (kind: LimitKind, dateKey: string) => void;
  resetUsageDay: (dateKey: string) => void;
  setOnboarded: () => void;
}

export function initialProfile(): UserProfile {
  return {
    displayName: '',
    tier: 'basis',
    credits: LIMITS.credits.start,
    follows: [],
    discovered: [],
    usageByDate: {},
    createdAt: clock.iso(),
    onboarded: false,
  };
}

const PersistedProfile = z.object({ profile: UserProfileSchema });

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: initialProfile(),
      setDisplayName: (name) =>
        set((s) => ({ profile: { ...s.profile, displayName: name.trim().slice(0, 40) } })),
      setTier: (tier) => set((s) => ({ profile: { ...s.profile, tier } })),
      addCredits: (amount) =>
        set((s) => ({
          profile: { ...s.profile, credits: Math.max(0, s.profile.credits + amount) },
        })),
      spendCredits: (amount) => {
        if (get().profile.credits < amount) return false;
        set((s) => ({ profile: { ...s.profile, credits: s.profile.credits - amount } }));
        return true;
      },
      toggleFollow: (figureId) =>
        set((s) => {
          const follows = s.profile.follows.includes(figureId)
            ? s.profile.follows.filter((id) => id !== figureId)
            : [...s.profile.follows, figureId];
          return { profile: { ...s.profile, follows } };
        }),
      discover: (figureId) => {
        if (get().profile.discovered.includes(figureId)) return false;
        set((s) => ({
          profile: { ...s.profile, discovered: [...s.profile.discovered, figureId] },
        }));
        return true;
      },
      consumeUsage: (kind, dateKey) =>
        set((s) => {
          const today = localDateKey(clock.now());
          const usage = consume(
            pruneUsage(s.profile.usageByDate, today),
            s.profile.tier,
            kind,
            dateKey,
          );
          return { profile: { ...s.profile, usageByDate: usage } };
        }),
      releaseUsage: (kind, dateKey) =>
        set((s) => ({
          profile: { ...s.profile, usageByDate: release(s.profile.usageByDate, kind, dateKey) },
        })),
      resetUsageDay: (dateKey) =>
        set((s) => ({
          profile: { ...s.profile, usageByDate: resetDay(s.profile.usageByDate, dateKey) },
        })),
      setOnboarded: () => set((s) => ({ profile: { ...s.profile, onboarded: true } })),
    }),
    persistOptions<ProfileState, { profile: UserProfile }>({
      name: 'profile',
      version: 1,
      schema: PersistedProfile,
      partialize: (s) => ({ profile: s.profile }),
    }),
  ),
);

registerStore({
  name: 'profile',
  version: 1,
  schema: PersistedProfile,
  rehydrate: () => useProfileStore.persist.rehydrate(),
});
