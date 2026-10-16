/**
 * Persona-blad per denker (§8.1). Wordt opgebouwd uit het profiel en is statisch per denker, dus
 * cachebaar direct na het kader. Kerndenkers hebben een rijk, handgeschreven profiel; voor
 * netwerkdenkers bouwt dezelfde functie een compacte persona uit hun compacte profiel.
 */
import { figureName } from '@/data/figures';
import { lifespanOf } from '@/data/figures/format';
import type { Figure } from '@/data/types';

const STATUS_LABEL = {
  authentiek: 'authentiek',
  parafrase: 'parafrase, noem het zo',
  toegeschreven: 'toegeschreven, onzeker',
} as const;

function list(items: readonly string[]): string {
  return items.map((item) => `- ${item}`).join('\n');
}

export function buildPersona(figure: Figure): string {
  const name = figure.name;
  const sections: string[] = [];

  sections.push(
    [
      `JE ROL`,
      `Je bent ${name}${figure.nativeName ? ` (${figure.nativeName})` : ''}, ${lifespanOf(figure)}: ${figure.epithet.charAt(0).toLowerCase()}${figure.epithet.slice(1)}.`,
      `Herkomst: ${figure.origin}. Stroming: ${figure.school}.`,
    ].join('\n'),
  );

  sections.push(`WIE JE BENT\n${figure.bio}`);

  if (figure.lifeEvents.length) {
    sections.push(
      `LEVENSLOOP\n${list(figure.lifeEvents.map((event) => `${event.year}: ${event.text}`))}`,
    );
  }

  if (figure.keyConcepts.length) {
    sections.push(
      `KERNBEGRIPPEN\n${list(
        figure.keyConcepts.map(
          (concept) =>
            `${concept.term}${concept.native ? ` (${concept.native})` : ''}: ${concept.explanation}`,
        ),
      )}`,
    );
  }

  sections.push(
    `WERKEN (de enige titels die je als leestip mag noemen)\n${list(
      figure.keyWorks.map(
        (work) =>
          `${work.title}${work.year ? ` (${work.year})` : ''}${work.note ? `: ${work.note}` : ''}`,
      ),
    )}`,
  );

  sections.push(
    [
      `STEM`,
      `Register: ${figure.voice.register}`,
      `Methode: ${figure.voice.method}`,
      figure.voice.habits.length ? `Gewoontes:\n${list(figure.voice.habits)}` : '',
      figure.voice.nativePhrases.length
        ? `Uitdrukkingen in je eigen taal (gebruik ze spaarzaam, altijd met vertaling):\n${list(
            figure.voice.nativePhrases.map((p) => `${p.phrase}: ${p.translation}`),
          )}`
        : '',
      figure.voice.avoid.length ? `Vermijd:\n${list(figure.voice.avoid)}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
  );

  sections.push(`KIJK OP NU\n${figure.modernLens}`);

  if (figure.controversies.length) {
    sections.push(
      `SCHADUWKANTEN (eerlijk en kritisch erkennen als ernaar gevraagd wordt; niet goedpraten, niets kwetsends herhalen)\n${list(figure.controversies)}`,
    );
  }

  const quotes = figure.quotes.filter((q) => q.verified);
  sections.push(
    quotes.length
      ? `GEVERIFIEERDE CITATEN (de enige die je letterlijk mag citeren, altijd met bron)\n${list(
          quotes.map((q) => `“${q.text}” (${q.source}) [${STATUS_LABEL[q.status]}]`),
        )}\nAlles wat je verder zegt, zeg je in eigen woorden.`
      : `GEVERIFIEERDE CITATEN\nGeen. Citeer jezelf dus niet letterlijk; spreek in eigen woorden.`,
  );

  if (figure.network.length) {
    sections.push(
      `MENSEN OM JE HEEN (je mag naar hen verwijzen)\n${list(
        figure.network.map(
          (link) => `${figureName(link.id)}: ${link.relation}${link.note ? ` (${link.note})` : ''}`,
        ),
      )}`,
    );
  }

  return sections.join('\n\n');
}
