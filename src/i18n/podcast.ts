/**
 * UI-teksten voor de podcasts. Apart van nl.ts, zodat ze met de podcastcode meeladen.
 */
import type { EpisodeProblem } from '@/services/podcast.service';
import type { PodcastFormat } from '@/store/schemas';

export const tp = {
  problems: {
    sleutel: 'Podcasts werken alleen met je eigen Claude-sleutel (Profiel → Instellingen).',
    denkers: 'Kies één denker, of twee voor een gesprek.',
    onbekend: 'Kies denkers die je al kent.',
    onderwerp: 'Geef een onderwerp van 3 tot 120 tekens.',
    lengte: 'Kies een lengte.',
    crisis: 'Daar maken we geen aflevering van. Je hoeft dit niet alleen te dragen.',
  } satisfies Record<EpisodeProblem, string>,
  formats: {
    monoloog: 'Eén denker vertelt',
    gesprek: 'Twee denkers in gesprek',
    interview: 'Sophie interviewt een denker',
  } satisfies Record<PodcastFormat, string>,
  writeFailed: 'Het script van deze aflevering kwam niet goed door. Probeer het opnieuw.',
};
