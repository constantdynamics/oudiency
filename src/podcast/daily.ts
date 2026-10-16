/**
 * De aflevering van vandaag klaarzetten als je de app opent (keuze 5a). Deze module zit in de
 * startbundel en is klein: pas als er echt een aflevering te schrijven is, laadt de AI-code.
 */
import { activeProviderId } from '@/ai';
import { localDateKey } from '@/lib/dates';
import { registerBackgroundTask } from '@/services/background';
import { usePodcastStore } from '@/store/podcastStore';

/** Is er vandaag nog een dagaflevering te maken? Alleen met je eigen Claude-sleutel. */
export function dailyEpisodeDue(now: number): boolean {
  const { settings, episodes } = usePodcastStore.getState();
  if (!settings.dailyEnabled || activeProviderId() !== 'anthropic-browser') return false;
  const day = localDateKey(now);
  return !episodes.some((e) => e.source === 'dagelijks' && e.day === day);
}

export function registerDailyEpisodeTask(): () => void {
  return registerBackgroundTask((now) => {
    if (!dailyEpisodeDue(now)) return;
    // Niet wachten: schrijven duurt even en mag de andere achtergrondtaken niet ophouden.
    void import('./podcastAi').then((ai) => ai.ensureDailyEpisode(now));
  });
}
