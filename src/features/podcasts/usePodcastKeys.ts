import { useAiMode } from '@/ai';
import { elevenLabsKeyStorage, useHasSecret } from '@/store/settingsStore';

/** Welke sleutels er zijn: Claude schrijft, ElevenLabs leest voor (keuze 9b: geen demomodus). */
export function usePodcastKeys(): { claude: boolean; elevenLabs: boolean } {
  const claude = useAiMode() === 'anthropic-browser';
  const elevenLabs = useHasSecret(elevenLabsKeyStorage);
  return { claude, elevenLabs };
}
