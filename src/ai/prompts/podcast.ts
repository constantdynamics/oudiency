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
- Spreektaal, geen schrijftaal: korte zinnen (meestal onder de vijftien woorden), weinig bijzinnen, geen opsommingen. Zoals mensen echt praten, met af en toe "nou", "kijk", "hm" of "weet je".
- Laat sprekers op elkaar reageren: "Precies.", "Wacht even…", "Ja, maar…". Een korte onderbreking mag, als die past.
- Natuurlijke overgangen, en af en toe een vraag aan de luisteraar.
- Geen opmaak: geen kopjes, lijstjes, sterretjes of emoji.
- Hooguit één emotie-aanwijzing per fragment, alleen waar het echt iets toevoegt: een Engels woord tussen blokhaken, zoals [laughs], [sighs], [thoughtful], [whispers] of [excited]. Verder geen regieaanwijzingen.
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

/** Wat de denkers van de luisteraar weten (keuze 8c): eerdere sessies en de eigen timeline. */
export interface ListenerMemory {
  /** Samenvattingen van eerdere sessies, per denker (meest recente eerst). */
  sessions: readonly { figureId: string; summaries: readonly string[] }[];
  /** Recente berichten van de luisteraar op de timeline (nieuwste eerst). */
  posts: readonly string[];
}

export interface PodcastContext {
  format: PodcastFormat;
  figures: readonly Figure[];
  topic: string;
  minutes: number;
  /** Naam van de luisteraar; Sophie mag die één keer noemen. */
  listenerName?: string;
  /** Bij een dagaflevering: waar de luisteraar zich mee bezighoudt (trefwoorden). */
  interests?: readonly string[];
  memory?: ListenerMemory;
}

/** Het geheugen als regels voor de opdracht (leeg als er niets is). */
export function memoryLines(
  memory: ListenerMemory | undefined,
  figures: readonly Pick<Figure, 'id' | 'name'>[],
): string[] {
  if (!memory) return [];
  const lines: string[] = [];
  for (const entry of memory.sessions) {
    const figure = figures.find((f) => f.id === entry.figureId);
    if (!figure || entry.summaries.length === 0) continue;
    lines.push(
      `EERDERE SESSIES van de luisteraar met ${figure.name} (samenvattingen, meest recente eerst):`,
    );
    for (const summary of entry.summaries) lines.push(`- ${summary.trim()}`);
  }
  if (memory.posts.length > 0) {
    lines.push('RECENTE BERICHTEN van de luisteraar op de timeline (nieuwste eerst):');
    for (const post of memory.posts) lines.push(`- ${post.trim().replace(/\s+/g, ' ')}`);
  }
  if (lines.length > 0) {
    lines.push(
      'Verwijs hier hooguit één keer naar als het past ("Je schreef laatst …"); herhaal het niet en maak het niet het onderwerp.',
    );
  }
  return lines;
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
  lines.push(...memoryLines(ctx.memory, ctx.figures));
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

/* ---------- Luistervragen (keuzes 7c en 8d) ---------- */

export const LISTENER_RULES = `LUISTERVRAAG
Een luisteraar stelt tijdens de aflevering een vraag. Schrijf de fragmenten die direct na het fragment klinken dat nu speelt:
1. Het eerste fragment is van Sophie: ze leest de vraag voor, kort en met de naam van de luisteraar als die bekend is. Belde de luisteraar in, dan vat ze de vraag in één of twee zinnen samen.
2. Dan antwoorden de denker of denkers: één tot drie fragmenten van elk hooguit 120 woorden, in karakter en concreet, met de aflevering als achtergrond. Bij twee denkers mogen ze kort op elkaar reageren.
3. Het laatste fragment brengt de aflevering in één of twee zinnen terug bij het onderwerp, gesproken door de denker die net sprak (of door Sophie in een interview). Is de aflevering afgelopen, dan sluit Sophie kort af.
- Verder dezelfde regels: schrijven voor het oor, geen opmaak, alleen geverifieerde citaten, en het blijft een AI-simulatie.
- Gaat de vraag nergens over of is hij ongepast, beantwoord hem dan kort en vriendelijk en ga terug naar het onderwerp.`;

export interface HeardSegment {
  /** Naam van de spreker. */
  speaker: string;
  text: string;
}

export interface ListenerQuestionContext extends PodcastContext {
  /** Wat de luisteraar net hoorde (de laatste fragmenten, oudste eerst). */
  heard: readonly HeardSegment[];
  /** Hoe de aflevering hierna verdergaat; leeg als hij afgelopen is. */
  next?: HeardSegment;
  /** De getypte vraag. */
  question?: string;
  /** Of: het gesprek met Sophie toen de luisteraar inbelde. */
  call?: readonly { role: 'user' | 'host'; text: string }[];
}

const clip = (text: string, max: number) => {
  const flat = text.trim().replace(/\s+/g, ' ');
  return flat.length > max ? `${flat.slice(0, max - 1)}…` : flat;
};

export function listenerQuestionInstruction(ctx: ListenerQuestionContext): string {
  const lines = [
    'Schrijf de fragmenten voor deze luistervraag.',
    `VORM: ${FORMAT_LABELS[ctx.format]}`,
    `ONDERWERP: ${ctx.topic}`,
    speakerLine(ctx),
  ];
  if (ctx.listenerName) lines.push(`LUISTERAAR: ${ctx.listenerName}`);
  if (ctx.heard.length > 0) {
    lines.push('WAT DE LUISTERAAR NET HOORDE (oudste eerst):');
    for (const part of ctx.heard) lines.push(`${part.speaker}: ${clip(part.text, 600)}`);
  }
  lines.push(
    ctx.next
      ? `HIERNA GAAT DE AFLEVERING ZO VERDER: ${ctx.next.speaker}: ${clip(ctx.next.text, 240)}`
      : 'DE AFLEVERING IS HIERNA AFGELOPEN.',
  );
  if (ctx.call && ctx.call.length > 0) {
    lines.push('DE LUISTERAAR BELDE IN BIJ SOPHIE. Het gesprek:');
    for (const line of ctx.call.slice(-16)) {
      lines.push(`${line.role === 'user' ? 'Luisteraar' : 'Sophie'}: ${clip(line.text, 400)}`);
    }
  } else if (ctx.question) {
    lines.push(`DE VRAAG: "${clip(ctx.question, 400)}"`);
  }
  lines.push(...memoryLines(ctx.memory, ctx.figures));
  lines.push('', LISTENER_RULES);
  return lines.join('\n');
}

/**
 * Zelfde systeemprompt als bij het schrijven van de aflevering (dus uit de cache als die nog
 * warm is); de opdracht voor de luistervraag staat in het bericht.
 */
export function listenerQuestionRequest(
  ctx: ListenerQuestionContext,
  episodeId: string,
): TextRequest {
  const base = podcastRequest(ctx, episodeId);
  return {
    ...base,
    task: 'podcastQuestion',
    messages: [{ role: 'user', content: listenerQuestionInstruction(ctx) }],
  };
}
