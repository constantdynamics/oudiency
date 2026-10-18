/**
 * Onderzoek op aanvraag: eerst een licht plan (zoektermen), dan een onderzoeksnotitie op basis van
 * Wikipedia- en Wikisource-fragmenten, en daarna een vorm (tekst, podcast, college, gesprek) met
 * die notitie als achtergrond. De gebruiker ziet de notitie niet (keuze 7c); de denkers wel.
 */
import { APP } from '@/config/app';
import { RESEARCH, type EssayLength } from '@/config/research';
import type { FigureMeta } from '@/data/figures';
import { lifespanOf } from '@/data/figures/format';
import type { Figure } from '@/data/types';
import type { ResearchBrief, ResearchSource } from '@/store/researchSchemas';
import type { TextRequest } from '../provider';
import { FRAME } from './frame';
import { readingList } from './lecture';
import { buildPersona } from './persona';

type FigureLine = Pick<FigureMeta, 'id' | 'name' | 'epithet' | 'born' | 'died'> &
  Partial<Pick<FigureMeta, 'approximate' | 'displayYears'>>;

function figureLine(figure: FigureLine): string {
  return `- ${figure.id}: ${figure.name} (${lifespanOf(figure)}), ${figure.epithet.replace(/\.$/, '')}`;
}

/* ---------- 1. Het plan ---------- */

export const RESEARCH_PLAN_TASK = `TAAK: ONDERZOEKSPLAN
Iemand in ${APP.name} wil een onderwerp laten uitzoeken. Daarna maken denkers uit de geschiedenis er iets van: een tekst, een podcast, een college of een gesprek. Jij bedenkt hoe we het uitzoeken in de Engelstalige Wikipedia en Wikisource.
- title: een korte Nederlandse titel voor het onderzoek (hooguit 60 tekens), zonder aanhalingstekens.
- wikipedia: twee of drie Engelse zoektermen die samen de vraag dekken: het onderwerp zelf, het belangrijkste begrip of de belangrijkste gebeurtenis, en waar het past het denken van de gekozen denkers erover. Elk één tot vijf woorden, geen zinnen.
- wikisource: nul tot twee Engelse zoektermen voor teksten van de gekozen denkers zelf over dit onderwerp (naam plus werk of thema, bijvoorbeeld "Seneca anger"). Leeg als er niets zinnigs is.
- suitable: false alleen als de vraag aanzet tot schade (geweld, wapens, misdrijven, haat), persoonlijke gegevens over een levend privépersoon zoekt of seksueel expliciet is. Zet dan in reason in één zin waarom. Gevoelige, pijnlijke of politieke onderwerpen zijn wél geschikt: die belichten we van meerdere kanten.`;

export function researchPlanRequest(
  question: string,
  figures: readonly FigureLine[],
  researchId: string,
): TextRequest {
  return {
    task: 'researchPlan',
    system: [{ text: RESEARCH_PLAN_TASK, cache: true }],
    messages: [
      {
        role: 'user',
        content: `VRAAG: ${question.trim()}\nGEKOZEN DENKERS:\n${figures.map(figureLine).join('\n')}`,
      },
    ],
    demo: { kind: 'research', researchId },
  };
}

/* ---------- 2. De onderzoeksnotitie ---------- */

/** Een bronfragment zoals het naar Claude gaat (genummerd vanaf 1). */
export interface SourceText extends ResearchSource {
  text: string;
}

export const RESEARCH_BRIEF_TASK = `TAAK: ONDERZOEKSNOTITIE
Je bent de onderzoeksredactie van ${APP.name}. Je schrijft een feitelijke notitie over de vraag van de gebruiker. Daarop baseren denkers uit de geschiedenis straks een tekst, podcast, college of gesprek. De gebruiker ziet de notitie zelf niet.

BRONNEN
- Je krijgt genummerde fragmenten uit de Engelstalige Wikipedia en Wikisource. Baseer je in de eerste plaats daarop en geef per feit de nummers.
- Wat je zeker weet maar niet in de fragmenten staat, mag erbij zonder nummer. Verzin niets: geen jaartallen, cijfers, namen of gebeurtenissen waar je niet zeker van bent. Bij twijfel weglaten.
- Spreken bronnen elkaar tegen, of is iets omstreden, zeg dat dan.
- Gaat de vraag over iets van na je kennis of van na de bronnen, of over iets lokaals dat er niet in staat, zeg dat in caveats.
- Zijn er geen fragmenten, werk dan alleen met wat je zeker weet en wees extra voorzichtig.

WAT JE OPLEVERT (in het Nederlands)
- summary: de kern in 150 tot 300 woorden.
- facts: vijf tot twaalf feiten of inzichten, elk in één of twee zinnen, met de bronnummers.
- perspectives: per gekozen denker één tot drie zinnen over hoe die vanuit het eigen denken naar deze vraag kijkt (een richting, geen citaat), en waar die met de andere gekozen denkers zou botsen.
- quotes: nul tot vier letterlijke citaten, alleen uit de Wikisource-fragmenten. Neem de tekst exact over zoals hij in het fragment staat, in de taal van de bron, zonder weglatingen (geen "…") en hooguit 60 woorden, met het bronnummer, en geef een Nederlandse vertaling. Niets uit Wikipedia, niets uit je geheugen: elk citaat wordt gecontroleerd en wat niet letterlijk in een fragment staat, valt weg.
- caveats: nul tot drie korte kanttekeningen.`;

export function sourceBlock(source: SourceText, n: number): string {
  const by =
    source.kind === 'wikisource' && source.author
      ? ` — auteur volgens de bron: ${source.author}${source.translator ? `, vertaald door ${source.translator}` : ''}`
      : '';
  const site = source.kind === 'wikipedia' ? 'Wikipedia' : 'Wikisource';
  return `[${n}] ${site}: "${source.title}"${by}\n${source.text.trim()}`;
}

export function researchBriefRequest(
  question: string,
  figures: readonly FigureLine[],
  sources: readonly SourceText[],
  researchId: string,
): TextRequest {
  const blocks =
    sources.length > 0
      ? sources.map((source, i) => sourceBlock(source, i + 1)).join('\n\n')
      : '(Geen fragmenten: Wikipedia en Wikisource waren niet bereikbaar of hadden niets.)';
  return {
    task: 'research',
    system: [{ text: RESEARCH_BRIEF_TASK, cache: true }],
    messages: [
      {
        role: 'user',
        content: [
          `VRAAG: ${question.trim()}\nGEKOZEN DENKERS (gebruik deze ids bij perspectives):\n${figures.map(figureLine).join('\n')}`,
          `BRONFRAGMENTEN\n${blocks}`,
        ],
      },
    ],
    demo: { kind: 'research', researchId },
  };
}

/* ---------- 3. De notitie als achtergrond voor een vorm ---------- */

/** "Seneca, Of Anger (vertaald door Aubrey Stewart), via Wikisource" */
export function quoteSource(source: ResearchSource): string {
  const by = source.author ? `${source.author}, ` : '';
  const translated = source.translator ? ` (vertaald door ${source.translator})` : '';
  return `${by}${source.title}${translated}, via Wikisource`;
}

export interface ResearchContext {
  question: string;
  brief: ResearchBrief;
  sources: readonly ResearchSource[];
  /** Namen per denker-id, voor de invalshoeken. */
  names: Readonly<Record<string, string>>;
}

/** De onderzoeksnotitie als blok voor een prompt (essay, podcast, college of gesprek). */
export function researchBlock({ question, brief, sources, names }: ResearchContext): string {
  const lines = [
    'ONDERZOEK OP AANVRAAG (de gebruiker liet dit uitzoeken; de gebruiker zag deze notitie niet)',
    `Vraag: ${question.trim()}`,
    brief.basis === 'bronnen'
      ? 'Basis: fragmenten uit de Engelstalige Wikipedia en Wikisource, aangevuld met algemene kennis.'
      : 'Basis: alleen algemene kennis (de bronnen waren niet bereikbaar). Wees extra voorzichtig met feiten en jaartallen.',
    '',
    'KERN',
    brief.summary.trim(),
  ];
  if (brief.facts.length > 0) {
    lines.push('', 'FEITEN', ...brief.facts.map((fact) => `- ${fact.text.trim()}`));
  }
  const angles = brief.perspectives.filter((p) => names[p.figureId]);
  if (angles.length > 0) {
    lines.push(
      '',
      'INVALSHOEKEN (richtingen, geen citaten)',
      ...angles.map((p) => `- ${names[p.figureId]}: ${p.angle.trim()}`),
    );
  }
  const quotes = brief.quotes.filter((quote) => sources[quote.source]);
  if (quotes.length > 0) {
    lines.push(
      '',
      'GECONTROLEERDE CITATEN UIT DE BRONNEN (letterlijk nagekeken; je mag ze citeren zoals de geverifieerde citaten in je persona: in het Nederlands, met "eigen vertaling" en de bron)',
      ...quotes.map(
        (quote) =>
          `- “${quote.translation.trim()}” — ${quoteSource(sources[quote.source]!)}. Origineel: "${quote.text.trim()}"`,
      ),
    );
  }
  if (brief.caveats.length > 0) {
    lines.push('', 'KANTTEKENINGEN', ...brief.caveats.map((caveat) => `- ${caveat.trim()}`));
  }
  return lines.join('\n');
}

/* ---------- 4. Tekst: een essay van de denker ---------- */

export const ESSAY_RULES = `ESSAY
Je schrijft, als jezelf, een essay over de vraag die de lezer liet uitzoeken. De onderzoeksnotitie is je achtergrond; je kent de wereld van nu en weet dat dit een AI-simulatie is.
- Schrijf in je eigen stijl en met je eigen methode (zie de persona), in de ik-vorm, en spreek de lezer aan met "je".
- Gebruik de feiten uit de notitie; verzin geen feiten, jaartallen of namen. Wat na jouw tijd ligt, benoem je als iets van na jouw tijd.
- Letterlijk citeren mag alleen uit je geverifieerde citaten en uit de gecontroleerde citaten in de notitie, in het Nederlands, met "(eigen vertaling)" en de bron. De rest zeg je in eigen woorden, zonder aanhalingstekens.
- Opmaak: een titel van hooguit 70 tekens en de tekst in alinea's met een witregel ertussen. Hooguit *cursief* en **vet**; geen kopjes, geen lijstjes, geen emoji.
- Eindig met een gedachte of vraag die de lezer meeneemt.
- Kies één tot drie leestips uit de lijst LEESTIPS (geef de nummers). Noem in de tekst geen andere titels als leestip.`;

export interface EssayContext extends ResearchContext {
  figure: Figure;
  length: EssayLength;
  /** De andere denkers uit het panel (namen), om kort op in te gaan. */
  others: readonly string[];
  readerName?: string;
}

export function essayInstruction(ctx: EssayContext): string {
  const words = RESEARCH.essayWords[ctx.length];
  const lines = [
    researchBlock(ctx),
    '',
    'OPDRACHT',
    `Schrijf het essay: ongeveer ${words} woorden.`,
  ];
  if (ctx.others.length > 0) {
    lines.push(
      `Ook ${ctx.others.join(' en ')} dachten mee (zie de invalshoeken). Ga daar hooguit kort op in, vanuit je eigen denken.`,
    );
  }
  const name = ctx.readerName?.trim();
  if (name) lines.push(`De lezer heet ${name}; noem de naam hooguit één keer.`);
  lines.push('', `LEESTIPS\n${readingList(ctx.figure)}`);
  return lines.join('\n');
}

export function essayRequest(ctx: EssayContext, researchId: string): TextRequest {
  return {
    task: 'researchText',
    system: [
      { text: FRAME, cache: true },
      { text: buildPersona(ctx.figure), cache: true },
      { text: ESSAY_RULES, cache: true },
    ],
    messages: [{ role: 'user', content: essayInstruction(ctx) }],
    demo: { kind: 'research', researchId },
  };
}
