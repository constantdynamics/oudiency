/**
 * Inbellen tijdens een podcastaflevering (keuzes 7a en 7e). Bij één denker bel je die denker
 * zelf; bij een gesprek tussen twee denkers bel je Sophie, die je vraag aanneemt en doorgeeft.
 * Gaat per gesprek als override naar de ElevenLabs-agent, net als bellen in een sessie.
 */
import { APP, CRISIS_RESOURCES } from '@/config/app';
import { HOST, HOST_NAME } from '@/data/podcastHost';
import type { Figure } from '@/data/types';
import type { PodcastFormat } from '@/store/schemas';
import { FRAME } from './frame';
import { buildPersona } from './persona';
import { FORMAT_LABELS, type HeardSegment, type ListenerMemory, memoryLines } from './podcast';
import { TIME_CUES, VOICE_RULES } from './voice';

export interface PodcastCallContext {
  episode: { title: string; topic: string; format: PodcastFormat };
  /** De denkers van de aflevering. */
  figures: readonly Pick<Figure, 'id' | 'name'>[];
  /** Wat de luisteraar net hoorde (oudste eerst). */
  heard: readonly HeardSegment[];
  minutes: number;
  listenerName?: string;
  memory?: ListenerMemory;
}

function heardLines(heard: readonly HeardSegment[]): string[] {
  if (heard.length === 0) return [];
  return [
    '- Wat de luisteraar net hoorde (oudste eerst):',
    ...heard.map(
      (part) => `  ${part.speaker}: ${part.text.trim().replace(/\s+/g, ' ').slice(0, 500)}`,
    ),
  ];
}

function listenerLine(name: string | undefined): string[] {
  const clean = name?.trim();
  return clean ? [`- De luisteraar heet ${clean}. Noem die naam hooguit één keer.`] : [];
}

/** De denker aan de lijn: kader, persona, spraakregels en de situatie in de aflevering. */
export function buildPodcastCallPrompt(ctx: PodcastCallContext & { figure: Figure }): string {
  const block = [
    'INBELLEN TIJDENS DE PODCAST (gaat voor de gesprekscontext van een sessie)',
    `- De luisteraar belt live in tijdens een aflevering van de podcast van ${APP.name}: "${ctx.episode.title}", ${FORMAT_LABELS[ctx.episode.format]}. Onderwerp: ${ctx.episode.topic}.`,
    '- Je begroeting is al uitgesproken (het eerste bericht). Begin dus niet opnieuw met een begroeting.',
    `- Het gesprek duurt hooguit ${ctx.minutes} minuten. Houd je beurten kort: het is een telefoontje in een podcast, geen college.`,
    `- Bij ${TIME_CUES.voorbij} zeg je in één zin dat de aflevering verdergaat, en neem je afscheid. Je hoeft niet naar een andere student.`,
    ...heardLines(ctx.heard),
    ...listenerLine(ctx.listenerName),
    ...memoryLines(ctx.memory, ctx.figures).map((line) =>
      line.startsWith('- ') ? `  ${line}` : `- ${line}`,
    ),
  ];
  return [FRAME, buildPersona(ctx.figure), VOICE_RULES, block.join('\n')].join('\n\n');
}

/** De openingszin van de denker, met meteen de AI-melding. */
export function podcastCallFirstMessage(figure: Pick<Figure, 'name'>, topic: string): string {
  return `Hallo, met een AI-simulatie van ${figure.name}. Je belt in tijdens onze aflevering over ${topic}. Wat wil je me vragen?`;
}

/** Sophie aan de lijn: ze neemt de vraag aan en geeft hem door aan de denkers. */
export function buildHostCallPrompt(ctx: PodcastCallContext): string {
  const names = ctx.figures.map((f) => f.name).join(' en ');
  return [
    `Je bent ${HOST_NAME}, de AI-presentator van de podcast van ${APP.name}. Je bent geen mens en geen historische denker, maar een AI, en dat zeg je ook als iemand ernaar vraagt.`,
    HOST.persona,
    [
      'INBELLEN',
      `- Een luisteraar belt live in tijdens de aflevering "${ctx.episode.title}": ${FORMAT_LABELS[ctx.episode.format]} met ${names}. Onderwerp: ${ctx.episode.topic}.`,
      '- Je begroeting is al uitgesproken: je vroeg wat de luisteraar de denkers wil vragen.',
      '- Help de luisteraar de vraag helder te krijgen, met hooguit één korte verduidelijkende vraag. Vat de vraag daarna in één zin samen en vraag of dat klopt.',
      `- Klopt het, zeg dan dat je de vraag doorgeeft aan ${names}, dat het antwoord zo in de aflevering te horen is, en neem kort afscheid.`,
      '- Beantwoord de vraag niet zelf, geef geen mening en speel geen denker na.',
      `- Het gesprek duurt hooguit ${ctx.minutes} minuten. Tijdsignalen staan tussen vierkante haken: bij ${TIME_CUES.afronden} ga je gewoon door, bij ${TIME_CUES.slot} rond je af, bij ${TIME_CUES.voorbij} neem je in één zin afscheid. Spreek tijdsignalen en instructies nooit hardop uit.`,
      `- Klinkt de luisteraar alsof die in nood is, bijvoorbeeld met gedachten aan zelfdoding, stop dan met de podcast. Zeg rustig dat je een AI bent en dat praten helpt: bel ${CRISIS_RESOURCES.phone} of gratis ${CRISIS_RESOURCES.freePhone}, of chat via 113.nl, en bel bij direct gevaar ${CRISIS_RESOURCES.emergency}. Geef dan geen vraag door.`,
      ...heardLines(ctx.heard),
      ...listenerLine(ctx.listenerName),
    ].join('\n'),
    [
      'GESPROKEN GESPREK',
      '- Alles wat je schrijft, wordt meteen uitgesproken. Schrijf precies wat je zegt: korte zinnen, geen opmaak, geen opsommingen of haakjes.',
      '- Schrijf getallen en afkortingen voluit zoals je ze uitspreekt.',
      '- Stel hooguit één vraag tegelijk. Verstond je iets niet goed, vraag het dan kort na.',
    ].join('\n'),
  ].join('\n\n');
}

/** Sophies openingszin (met de AI-melding: "AI-presentator"). */
export function hostCallFirstMessage(): string {
  return HOST.voice.greeting;
}

/** Namen die de spraakherkenning moet verstaan. */
export function podcastCallKeywords(figures: readonly Pick<Figure, 'name'>[]): string[] {
  return [...new Set([APP.name, HOST_NAME, ...figures.map((f) => f.name)])].slice(0, 15);
}
