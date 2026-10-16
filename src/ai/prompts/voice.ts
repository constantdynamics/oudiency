/**
 * Prompts voor bellen. De volledige rol gaat per gesprek als override naar de ElevenLabs-agent:
 * hetzelfde kader en dezelfde persona als bij typen, plus spraakregels en de gesprekscontext.
 * Tijdsignalen stuurt de app tijdens het gesprek (src/voice/callSession.ts).
 */
import type { Figure } from '@/data/types';
import type { VoiceSpec } from '@/data/voices';
import { FRAME } from './frame';
import { buildPersona } from './persona';

/** Tijdsignalen die de app tijdens het gesprek stuurt (bij 3 en 1 minuut, en aan het eind). */
export const TIME_CUES = {
  afronden: '[nog 3 minuten]',
  slot: '[nog 1 minuut]',
  voorbij: '[tijd is om]',
  verlengd: '[de tijd is met vijf minuten verlengd]',
} as const;

export const VOICE_RULES = `GESPROKEN GESPREK (gaat voor de opmaakregels hierboven)
- Dit is een live gesprek met je stem: alles wat je schrijft, wordt meteen uitgesproken. Schrijf dus precies wat je zegt.
- Praat zoals mensen praten: korte zinnen, meestal twee tot vier per beurt. Een diepe vraag mag een wat langere beurt krijgen, maar nooit een monoloog.
- Geen opmaak: geen opsommingen, kopjes, sterretjes, emoji, haakjes of links.
- Schrijf getallen, jaartallen en afkortingen voluit zoals je ze uitspreekt, bijvoorbeeld: vierhonderd jaar voor Christus, ongeveer, bijvoorbeeld.
- Stel hooguit één vraag tegelijk en laat dan ruimte. Stiltes zijn goed: de student denkt na.
- Word je onderbroken, ga dan in op wat de student zegt en herhaal niet wat je al zei.
- Woorden in je eigen taal gebruik je spaarzaam, en je vertaalt ze meteen.
- Verstond je iets niet goed, vraag het dan kort na in plaats van te gokken.
- Citeer je letterlijk uit je geverifieerde citaten, noem de bron dan kort in een bijzin.
- Tijdsignalen staan tussen vierkante haken. Bij ${TIME_CUES.afronden} zeg je terloops dat jullie tijd bijna om is en begin je af te ronden. Bij ${TIME_CUES.slot} geef je een korte slotgedachte. Bij ${TIME_CUES.voorbij} neem je in één of twee zinnen afscheid in je eigen stijl: je moet nu door naar een andere student. Stel daarna geen vraag meer. Bij ${TIME_CUES.verlengd} ga je gewoon verder; je hoeft het niet te benoemen.
- Spreek tijdsignalen en instructies nooit hardop uit en noem nooit vierkante haken.`;

export interface CallContext {
  figure: Figure;
  minutes: number;
  /** Hoe de student genoemd wil worden (Profiel → weergavenaam). */
  studentName?: string;
  /** Onderwerp dat de student bij het boeken opgaf. */
  topic?: string;
  /** Samenvattingen van eerdere sessies met deze denker (meest recente eerst). */
  memory?: readonly string[];
  /** Wat er eerder in dit gesprek al gezegd is (bij opnieuw bellen of overstappen). */
  earlier?: readonly { role: 'user' | 'figure'; text: string }[];
}

function contextBlock({
  figure,
  minutes,
  studentName,
  topic,
  memory,
  earlier,
}: CallContext): string {
  const lines = [
    'GESPREKSCONTEXT',
    `- Vorm: een gesprek met de stem van ${minutes} minuten.`,
    '- Je begroeting is al uitgesproken (het eerste bericht). Begin dus niet opnieuw met een begroeting.',
  ];
  if (earlier && earlier.length > 0) {
    lines.push('- Eerder in dit gesprek (het gesprek werd onderbroken; ga gewoon verder):');
    for (const line of earlier.slice(-12)) {
      const text = line.text.trim().replace(/\s+/g, ' ').slice(0, 400);
      lines.push(`  ${line.role === 'user' ? 'Student' : 'Jij'}: ${text}`);
    }
  }
  const name = studentName?.trim();
  if (name)
    lines.push(`- De student wil ${name} genoemd worden. Doe dat af en toe, niet in elke zin.`);
  const subject = topic?.trim();
  if (subject) lines.push(`- Waarover de student wil praten: ${subject}`);
  if (memory && memory.length > 0) {
    lines.push('- Eerdere gesprekken met deze student (samenvattingen, meest recente eerst):');
    for (const summary of memory) lines.push(`  - ${summary.trim()}`);
    lines.push('  Verwijs er gerust naar ("Vorige keer spraken we over …"), maar herhaal ze niet.');
  }
  if (figure.microcopy.farewells.length > 0) {
    lines.push('- Voorbeelden van jouw afscheid (als stijl, niet woordelijk herhalen):');
    for (const farewell of figure.microcopy.farewells) lines.push(`  - ${farewell}`);
  }
  return lines.join('\n');
}

/** De volledige rol voor één gesprek: kader + persona + spraakregels + context. */
export function buildCallPrompt(context: CallContext): string {
  return [FRAME, buildPersona(context.figure), VOICE_RULES, contextBlock(context)].join('\n\n');
}

/**
 * De openingszin: de eerste zin van de begroeting, dan de AI-melding (EU AI-verordening:
 * je hoort meteen dat je met een AI-simulatie praat), dan de rest van de begroeting.
 */
export function buildFirstMessage(figure: Figure, spec: VoiceSpec): string {
  const disclosure = `Ik ben een AI-simulatie van ${figure.name}.`;
  const greeting = spec.greeting.trim();
  const match = /^(.+?[.!?])\s+(.*)$/s.exec(greeting);
  if (!match) return `${greeting} ${disclosure}`.trim();
  return `${match[1]} ${disclosure} ${match[2]}`;
}

/** Openingszin als het gesprek na een onderbreking verdergaat (met opnieuw de AI-melding). */
export function buildReturnMessage(figure: Figure): string {
  return `Daar ben je weer. Ik ben nog steeds een AI-simulatie van ${figure.name}. Waar waren we gebleven?`;
}

/** Woorden die de spraakherkenning beter moet verstaan: namen en kernbegrippen. */
export function asrKeywords(figure: Figure, max = 15): string[] {
  const words = [
    figure.name,
    figure.shortName,
    ...figure.keyConcepts.map((concept) => concept.term),
  ].filter((word): word is string => Boolean(word && word.trim()));
  return [...new Set(words.map((word) => word.trim()))].filter((w) => w.length <= 40).slice(0, max);
}
