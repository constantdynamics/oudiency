/**
 * Podcastafleveringen: één script om naar te luisteren, geschreven voor het oor. Drie vormen:
 * één denker vertelt, twee denkers in gesprek, of Sophie interviewt een denker. Sophie opent
 * (met de AI-melding) en sluit af. Het vaste deel staat vooraan in de systeemprompt (cache);
 * wat per aflevering verschilt, staat in de opdracht.
 */
import { APP } from '@/config/app';
import { PODCAST } from '@/config/podcast';
import { HOST, HOST_ID } from '@/data/podcastHost';
import type { Figure } from '@/data/types';
import type { PodcastFormat } from '@/store/schemas';
import type { TextRequest } from '../provider';
import { FRAME } from './frame';
import { buildPersona } from './persona';

export const PODCAST_RULES = `TAAK: PODCASTAFLEVERING
Je schrijft het volledige script van een aflevering van de podcast van ${APP.name}. Elk fragment wordt uitgesproken door de stem van de spreker; de luisteraar ziet niets, hoort alleen.

SCHRIJVEN VOOR HET OOR
- Gesproken taal: korte zinnen, natuurlijke overgangen, af en toe een vraag aan de luisteraar.
- Geen opmaak: geen kopjes, lijstjes, sterretjes, emoji, en geen regieaanwijzingen tussen haakjes.
- Elk fragment is één beurt van één spreker, meestal 40 tot 180 woorden.
- Herhaal geen namen en woorden in elke zin; laat de sprekers elkaar af en toe bij naam noemen, zodat de luisteraar weet wie er spreekt.

DE PRESENTATOR
${HOST.persona}
- Het eerste fragment is van Sophie: ze opent, zegt in eigen woorden dat dit een AI-simulatie is (gebruik het woord "AI-simulatie"), stelt de denker of denkers voor en noemt het onderwerp.
- Het laatste fragment is van Sophie: ze rondt kort af en geeft de luisteraar één vraag mee om over na te denken.

DE DENKERS
- Spreek in karakter (zie de persona's): eigen methode, beelden en manier van spreken, met moderne kennis waar het past.
- Citeer alleen letterlijk uit de geverifieerde citaten in de persona, en zeg dan waar het vandaan komt. Al het andere in eigen woorden.
- Bij een gesprek tussen twee denkers: ze reageren echt op elkaar, zijn het oneens waar dat bij hun denken past, en vinden hooguit ergens elkaar.

VORMEN
- monoloog: de denker vertelt, in meerdere fragmenten achter elkaar. Sophie komt alleen aan het begin en het eind aan het woord, en hooguit één keer halverwege met een korte overgangsvraag.
- gesprek: twee denkers wisselen elkaar af. Sophie opent, sluit af en stelt hooguit één keer een korte vraag.
- interview: Sophie stelt korte, scherpe vragen (één tot drie zinnen) en de denker antwoordt uitgebreider; ze wisselen elkaar af.`;

export const FORMAT_LABELS: Record<PodcastFormat, string> = {
  monoloog: 'monoloog (één denker vertelt)',
  gesprek: 'gesprek tussen twee denkers',
  interview: 'interview (Sophie interviewt de denker)',
};

export interface PodcastContext {
  format: PodcastFormat;
  figures: readonly Figure[];
  topic: string;
  minutes: number;
  /** Naam van de luisteraar; Sophie mag die één keer noemen. */
  listenerName?: string;
  /** Bij een dagaflevering: waar de luisteraar zich mee bezighoudt (trefwoorden). */
  interests?: readonly string[];
}

/** Woorden voor de gevraagde lengte (gesproken tempo). */
export function targetWords(minutes: number): number {
  return Math.round(minutes * PODCAST.wordsPerMinute);
}

function speakerLine(ctx: PodcastContext): string {
  const figures = ctx.figures.map((f) => `${f.id} (${f.name})`).join(', ');
  return `SPREKERS (gebruik alleen deze ids): ${HOST_ID} (Sophie, presentator), ${figures}`;
}

export function podcastInstruction(ctx: PodcastContext): string {
  const lines = [
    'Schrijf het script van deze aflevering.',
    `VORM: ${FORMAT_LABELS[ctx.format]}`,
    `ONDERWERP: ${ctx.topic}`,
    `LENGTE: ongeveer ${ctx.minutes} minuten, dus rond ${targetWords(ctx.minutes)} woorden in totaal.`,
    speakerLine(ctx),
  ];
  if (ctx.listenerName) {
    lines.push(`LUISTERAAR: ${ctx.listenerName} (Sophie mag die naam één keer noemen).`);
  }
  if (ctx.interests?.length) {
    lines.push(
      `Dit is de aflevering van vandaag, gekozen bij wat de luisteraar bezighoudt: ${ctx.interests.join(', ')}. Noem die trefwoorden niet als lijstje; laat ze terugkomen in voorbeelden.`,
    );
  }
  return lines.join('\n');
}

export function podcastRequest(ctx: PodcastContext, episodeId: string): TextRequest {
  return {
    task: 'podcast',
    system: [
      { text: FRAME, cache: true },
      ...ctx.figures.map((figure) => ({ text: buildPersona(figure), cache: true })),
      { text: PODCAST_RULES, cache: true },
    ],
    messages: [{ role: 'user', content: podcastInstruction(ctx) }],
    demo: { kind: 'podcast', episodeId },
  };
}
