import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  essayInstruction,
  quoteSource,
  researchBlock,
  researchBriefRequest,
  researchPlanRequest,
  sourceBlock,
  type SourceText,
} from '@/ai/prompts/research';
import { buildCallPrompt, researchFirstMessage } from '@/ai/prompts/voice';
import { RESEARCH } from '@/config/research';
import { CORE_IDS, findMeta, type FigureMeta } from '@/data/figures';
import { ALL_FIGURES } from '@/data/figures/all';
import type { Figure } from '@/data/types';
import { voiceSpecFor } from '@/data/voices';
import { isVerbatim, matchable, toBrief } from '@/research/brief';
import { costLines, essayEur, researchEur, totalEur } from '@/research/estimate';
import { gatherSources, interleave, type WikiClient } from '@/research/gather';
import { researchCallVoice } from '@/research/researchCall';
import {
  clip,
  extractParagraphs,
  passagesText,
  relevance,
  searchTerms,
  selectPassages,
} from '@/research/passages';
import {
  apiUrl,
  pageUrl,
  parseWikisourceHtml,
  searchWiki,
  WikiError,
  wikipediaPage,
  wikisourcePage,
} from '@/research/wiki';
import { consume, dailyLimit, release, remainingOn } from '@/services/limits.service';
import {
  draftRequest,
  formProblem,
  initialDraft,
  newOutput,
  newResearch,
  podcastFormats,
  researchProblem,
} from '@/services/research.service';
import type { ResearchBrief } from '@/store/researchSchemas';
import { initialVoiceState, useVoiceStore } from '@/store/voiceStore';
import type { ElevenLabsApi } from '@/voice/api';

const meta = (id: string) => findMeta(id) as FigureMeta;
const figure = (id: string) => ALL_FIGURES.find((f) => f.id === id) as Figure;

afterEach(() => {
  vi.unstubAllGlobals();
});

/* ---------- Passages kiezen ---------- */

describe('passages', () => {
  const plain = [
    'Stoicism is a school of Hellenistic philosophy founded in Athens by Zeno of Citium around 300 BC.',
    '',
    '== Ethics ==',
    'The Stoics held that anger is a passion that arises from a false judgement about what is good or bad.',
    'Short line.',
    '=== Emotions ===',
    'Seneca wrote that emotions such as anger can be overcome by reason and by delaying our response.',
    '== See also ==',
    'Epicureanism is another Hellenistic school of philosophy that competed with the Stoics.',
    '== References ==',
    'Long, A. A. (1974). Hellenistic Philosophy: Stoics, Epicureans, Sceptics. London: Duckworth.',
  ].join('\n');

  it('platte tekst als alinea’s, zonder "See also", "References" en korte regels', () => {
    const paragraphs = extractParagraphs(plain);
    expect(paragraphs.map((p) => p.section)).toEqual(['', 'Ethics', 'Emotions']);
    expect(paragraphs.some((p) => p.text.includes('Epicureanism'))).toBe(false);
    expect(paragraphs.some((p) => p.text.includes('Duckworth'))).toBe(false);
  });

  it('zoekwoorden: Engels, zonder stopwoorden, gestemd', () => {
    expect(searchTerms(['Anger and the emotions', 'Seneca'])).toEqual([
      'anger',
      'emotion',
      'seneca',
    ]);
    const [, ethics] = extractParagraphs(plain);
    expect(relevance(ethics!, searchTerms(['anger']))).toBe(1);
  });

  it('kiest de inleiding en de best passende alinea’s, in de oorspronkelijke volgorde', () => {
    const paragraphs = extractParagraphs(plain);
    const chosen = selectPassages(paragraphs, searchTerms(['Seneca anger emotions']), 6_000);
    expect(chosen.map((p) => p.section)).toEqual(['', 'Ethics', 'Emotions']);
    const text = passagesText(chosen);
    expect(text).toContain('[Ethics]');
    expect(text.indexOf('Stoicism is')).toBeLessThan(text.indexOf('Seneca wrote'));
  });

  it('zonder inleiding (Wikisource) alleen wat over de vraag gaat', () => {
    const paragraphs = extractParagraphs(plain);
    const chosen = selectPassages(paragraphs, searchTerms(['Seneca']), 6_000, false);
    expect(chosen).toHaveLength(1);
    expect(chosen[0]!.text).toContain('Seneca wrote');
    expect(selectPassages(paragraphs, searchTerms(['quantum']), 6_000, false)).toEqual([]);
  });

  it('houdt zich aan het budget en kort in op een zinsgrens', () => {
    const long = Array.from({ length: 30 }, (_, i) => `Anger is topic number ${i} here.`).join(' ');
    expect(clip(long, 120).length).toBeLessThanOrEqual(120);
    expect(clip(long, 120).endsWith('.')).toBe(true);
    expect(
      clip('Geen zinsgrens hier en ook nog lang genoeg om te knippen ' + 'x'.repeat(200), 90),
    ).toBe('');
    const paragraphs = Array.from({ length: 20 }, (_, i) => ({
      section: 'Anger',
      text: `Anger paragraph ${i}. ${'Reason calms anger. '.repeat(20)}`,
    }));
    const chosen = selectPassages(paragraphs, ['anger'], 2_000, false);
    expect(chosen.reduce((sum, p) => sum + p.text.length, 0)).toBeLessThanOrEqual(2_000);
  });
});

/* ---------- Wikipedia en Wikisource ---------- */

function json(data: unknown): Response {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

describe('wiki', () => {
  it('links en API-adressen (anoniem met origin=*)', () => {
    expect(pageUrl('wikipedia', 'Marcus Aurelius')).toBe(
      'https://en.wikipedia.org/wiki/Marcus_Aurelius',
    );
    expect(pageUrl('wikisource', 'Of Anger/Book I')).toBe(
      'https://en.wikisource.org/wiki/Of_Anger/Book_I',
    );
    const url = new URL(
      apiUrl('wikipedia', { action: 'query', list: 'search', srsearch: 'anger' }),
    );
    expect(url.origin).toBe('https://en.wikipedia.org');
    expect(url.pathname).toBe('/w/api.php');
    expect(url.searchParams.get('origin')).toBe('*');
    expect(url.searchParams.get('formatversion')).toBe('2');
  });

  it('zoeken: titels, zonder doorverwijspagina’s; alleen zoektermen gaan mee', async () => {
    const fetchMock = vi.fn(async () =>
      json({
        query: {
          search: [{ title: 'Anger' }, { title: 'Anger (disambiguation)' }, { title: 'Stoicism' }],
        },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const hits = await searchWiki('wikipedia', 'stoic anger', 3);
    expect(hits.map((h) => h.title)).toEqual(['Anger', 'Stoicism']);
    const url = new URL(String((fetchMock.mock.calls[0] as unknown[])[0]));
    expect(url.searchParams.get('srsearch')).toBe('stoic anger');
    expect(url.searchParams.get('srnamespace')).toBe('0');
  });

  it('artikel als platte tekst; een ontbrekende pagina geeft niets', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        json({
          query: {
            pages: [
              {
                title: 'Anger',
                extract:
                  'Anger is an intense emotional state involving a strong uncomfortable response.\n== History ==\nSeneca discussed anger at length in his essay on the subject, De Ira.',
              },
            ],
          },
        }),
      ),
    );
    const page = await wikipediaPage('Anger');
    expect(page).toMatchObject({ site: 'wikipedia', title: 'Anger' });
    expect(page?.url).toBe('https://en.wikipedia.org/wiki/Anger');
    expect(page?.paragraphs).toHaveLength(2);

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({ query: { pages: [{ title: 'X', missing: true }] } })),
    );
    expect(await wikipediaPage('X')).toBeUndefined();
  });

  it('fouten van de API, het netwerk of een time-out worden een WikiError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({ error: { code: 'badvalue', info: 'Unrecognized value' } })),
    );
    await expect(searchWiki('wikipedia', 'x', 3)).rejects.toBeInstanceOf(WikiError);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        throw new TypeError('Failed to fetch');
      }),
    );
    await expect(wikipediaPage('x')).rejects.toBeInstanceOf(WikiError);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('nope', { status: 503 })),
    );
    await expect(searchWiki('wikisource', 'x', 3)).rejects.toThrow('HTTP 503');
  });

  const WIKISOURCE_HTML = `
    <div class="mw-parser-output">
      <div id="ws-data" class="ws-noexport" style="display:none"><span id="ws-title">Of Anger</span><span id="ws-author">Lucius Annaeus Seneca</span><span id="ws-translator">Aubrey Stewart</span></div>
      <div class="wst-header ws-header"><p>by <a href="/wiki/Author:Lucius_Annaeus_Seneca">Lucius Annaeus Seneca</a>, translated by <a href="/wiki/Author:Aubrey_Stewart">Aubrey Stewart</a> and with some more header text</p></div>
      <p>You have importuned me, Novatus, to write on the subject of how anger may be soothed.<sup class="reference">[1]</sup></p>
      <p><span class="pagenum">12</span>The best plan is to reject at once the first incentives to anger, and to resist its very beginnings.</p>
      <dl><dd>Some men have called anger a short madness, for it is equally devoid of self control.</dd><dd><p>An indented paragraph that is long enough to be kept as text here.</p></dd></dl>
      <table><tr><td>A table that is long enough but is not running text at all, really.</td></tr></table>
      <ol class="references"><li>Note that is not part of the text.</li></ol>
    </div>`;

  it('Wikisource-HTML: auteur en vertaler uit de kop, alleen de lopende tekst', () => {
    const parsed = parseWikisourceHtml(WIKISOURCE_HTML);
    expect(parsed.author).toBe('Lucius Annaeus Seneca');
    expect(parsed.translator).toBe('Aubrey Stewart');
    const texts = parsed.paragraphs.map((p) => p.text);
    expect(texts).toHaveLength(4);
    expect(texts[0]).toBe(
      'You have importuned me, Novatus, to write on the subject of how anger may be soothed.',
    );
    expect(texts[1]).toBe(
      'The best plan is to reject at once the first incentives to anger, and to resist its very beginnings.',
    );
    expect(texts.join(' ')).not.toMatch(/translated by|table|Note that/);
  });

  it('Wikisource zonder microformat: de eerste auteurslink', () => {
    const parsed = parseWikisourceHtml(
      '<div><a href="/wiki/Author:Marcus_Aurelius">Marcus Aurelius</a><p>Begin the morning by saying to thyself, I shall meet with the busy-body.</p></div>',
    );
    expect(parsed.author).toBe('Marcus Aurelius');
    expect(parsed.translator).toBeUndefined();
  });

  it('Wikisource-pagina ophalen via de parse-API', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => json({ parse: { title: 'Of Anger/Book I', text: WIKISOURCE_HTML } })),
    );
    const page = await wikisourcePage('Of Anger/Book I');
    expect(page).toMatchObject({
      site: 'wikisource',
      title: 'Of Anger/Book I',
      url: 'https://en.wikisource.org/wiki/Of_Anger/Book_I',
      author: 'Lucius Annaeus Seneca',
    });
  });
});

/* ---------- Bronnen verzamelen ---------- */

describe('bronnen verzamelen', () => {
  it('om en om uit elke zoekopdracht, zonder dubbele titels', () => {
    expect(interleave([['A', 'B', 'C'], ['B', 'D'], ['E']], 4)).toEqual(['A', 'B', 'E', 'D']);
  });

  it('zoekt, leest en kiest; wat faalt, valt weg', async () => {
    const client: WikiClient = {
      search: async (site, query) => {
        if (query === 'kapot') throw new WikiError('offline');
        return site === 'wikipedia'
          ? [{ title: 'Anger' }, { title: 'Stoicism' }]
          : [{ title: 'Of Anger' }];
      },
      page: async (site, title) => {
        if (title === 'Stoicism') throw new WikiError('offline');
        return {
          site,
          title,
          url: pageUrl(site, title),
          ...(site === 'wikisource' ? { author: 'Seneca' } : {}),
          paragraphs: [
            {
              section: '',
              text: `${title}: anger is a passion that reason can calm, said Seneca.`,
            },
          ],
        };
      },
    };
    const sources = await gatherSources(
      { wikipedia: ['anger', 'kapot', 'anger'], wikisource: ['Seneca anger'] },
      ['Seneca'],
      client,
    );
    expect(sources.map((s) => `${s.kind}:${s.title}`)).toEqual([
      'wikipedia:Anger',
      'wikisource:Of Anger',
    ]);
    expect(sources[1]).toMatchObject({ author: 'Seneca' });
    expect(sources[0]!.text).toContain('anger is a passion');
  });

  it('niets bereikbaar: geen bronnen (dan werkt Claude met eigen kennis)', async () => {
    const offline: WikiClient = {
      search: async () => {
        throw new WikiError('offline');
      },
      page: async () => undefined,
    };
    expect(await gatherSources({ wikipedia: ['x'], wikisource: ['y'] }, [], offline)).toEqual([]);
  });
});

/* ---------- De notitie en de citaten ---------- */

const SOURCES: SourceText[] = [
  {
    kind: 'wikipedia',
    title: 'Anger',
    url: 'https://en.wikipedia.org/wiki/Anger',
    text: 'Seneca called anger “a brief madness”, according to many commentators.',
  },
  {
    kind: 'wikisource',
    title: 'Of Anger/Book I',
    url: 'https://en.wikisource.org/wiki/Of_Anger/Book_I',
    author: 'Lucius Annaeus Seneca',
    translator: 'Aubrey Stewart',
    text: 'The best plan is to reject at once the first incentives to anger, and to resist its very beginnings.',
  },
];

describe('citaten controleren', () => {
  it('letterlijk: aanhalingstekens, witruimte, hoofdletters en het slotteken tellen niet', () => {
    expect(matchable('“It’s  a — test”')).toBe('"it\'s a - test"');
    const source = SOURCES[1]!.text;
    expect(
      isVerbatim('the best plan is to reject at once the first incentives to anger.', source),
    ).toBe(true);
    expect(isVerbatim('"The best plan is to reject   at once"', source)).toBe(true);
  });

  it('niet letterlijk, met weglating, te kort of te lang: weg', () => {
    const source = SOURCES[1]!.text;
    expect(isVerbatim('The best plan is to resist anger at once.', source)).toBe(false);
    expect(isVerbatim('The best plan is … its very beginnings', source)).toBe(false);
    expect(isVerbatim('The best', source)).toBe(false);
    expect(isVerbatim('x'.repeat(RESEARCH.quoteLength.max + 1), 'x'.repeat(500))).toBe(false);
  });

  it('toBrief: alleen gecontroleerde citaten uit Wikisource, geldige bronnummers en denkers', () => {
    const brief = toBrief(
      {
        summary: '  Woede is volgens de Stoa een oordeel.  ',
        facts: [
          { text: 'Seneca schreef De Ira.', sources: [2, 2, 9, 0] },
          { text: '  ', sources: [] },
          { text: 'Algemene kennis.', sources: [] },
        ],
        perspectives: [
          { figureId: 'seneca', angle: 'Uitstellen helpt.' },
          { figureId: 'seneca', angle: 'Dubbel.' },
          { figureId: 'kant', angle: 'Niet gekozen.' },
          { figureId: 'socrates', angle: 'Vraag door.' },
        ],
        quotes: [
          {
            text: 'The best plan is to reject at once the first incentives to anger',
            source: 2,
            translation: 'Het beste is de eerste prikkels tot woede meteen af te wijzen',
          },
          { text: 'a brief madness, according to many', source: 1, translation: 'Uit Wikipedia' },
          {
            text: 'Anger is the enemy of reason, said Seneca.',
            source: 2,
            translation: 'Verzonnen',
          },
          {
            text: 'the best plan is to reject at once the first incentives to anger.',
            source: 2,
            translation: 'Dubbel',
          },
          { text: 'The best plan is to reject at once the first', source: 7, translation: 'Bron?' },
        ],
        caveats: ['Recent onderzoek ontbreekt.', ' ', 'a', 'b', 'c'],
      },
      SOURCES,
      ['seneca', 'socrates'],
    );
    expect(brief.basis).toBe('bronnen');
    expect(brief.summary).toBe('Woede is volgens de Stoa een oordeel.');
    expect(brief.facts).toEqual([
      { text: 'Seneca schreef De Ira.', sources: [1] },
      { text: 'Algemene kennis.', sources: [] },
    ]);
    expect(brief.perspectives.map((p) => p.figureId)).toEqual(['seneca', 'socrates']);
    expect(brief.quotes).toEqual([
      {
        text: 'The best plan is to reject at once the first incentives to anger',
        translation: 'Het beste is de eerste prikkels tot woede meteen af te wijzen',
        source: 1,
      },
    ]);
    expect(brief.caveats).toEqual(['Recent onderzoek ontbreekt.', 'a', 'b']);
  });

  it('zonder bronnen: basis is eigen kennis en er blijven geen citaten over', () => {
    const brief = toBrief(
      {
        summary: 'Kern.',
        facts: [],
        perspectives: [],
        quotes: [
          { text: 'Iets uit het geheugen van Claude, lang genoeg.', source: 1, translation: 'x' },
        ],
        caveats: [],
      },
      [],
      ['seneca'],
    );
    expect(brief.basis).toBe('kennis');
    expect(brief.quotes).toEqual([]);
  });
});

/* ---------- Prompts ---------- */

const BRIEF: ResearchBrief = {
  basis: 'bronnen',
  summary: 'Woede is volgens de Stoa een verkeerd oordeel.',
  facts: [{ text: 'Seneca schreef De Ira.', sources: [1] }],
  perspectives: [
    { figureId: 'seneca', angle: 'Stel je reactie uit.' },
    { figureId: 'socrates', angle: 'Vraag wat woede is.' },
  ],
  quotes: [
    {
      text: 'The best plan is to reject at once the first incentives to anger',
      translation: 'Het beste is de eerste prikkels tot woede meteen af te wijzen',
      source: 1,
    },
  ],
  caveats: ['Over moderne psychologie zeggen de bronnen weinig.'],
};
const STORED_SOURCES = SOURCES.map(({ text: _text, ...source }) => source);

describe('prompts', () => {
  it('plan: Haiku-taak, zoektermen in het Engels, de vraag en de gekozen denkers', () => {
    const request = researchPlanRequest('Hoe ga je om met woede?', [meta('seneca')], 'o1');
    expect(request.task).toBe('researchPlan');
    expect(request.demo).toEqual({ kind: 'research', researchId: 'o1' });
    expect(request.system[0]!.text).toContain('Engelstalige Wikipedia en Wikisource');
    expect(request.messages[0]!.content).toContain('VRAAG: Hoe ga je om met woede?');
    expect(request.messages[0]!.content).toContain('- seneca: Seneca');
  });

  it('notitie: genummerde fragmenten met auteur en vertaler, of de melding dat er niets is', () => {
    expect(sourceBlock(SOURCES[1]!, 2)).toBe(
      `[2] Wikisource: "Of Anger/Book I" — auteur volgens de bron: Lucius Annaeus Seneca, vertaald door Aubrey Stewart\n${SOURCES[1]!.text}`,
    );
    const request = researchBriefRequest('Woede', [meta('seneca')], SOURCES, 'o1');
    expect(request.task).toBe('research');
    const content = request.messages[0]!.content as string[];
    expect(content[1]).toContain('[1] Wikipedia: "Anger"');
    expect(content[1]).toContain('[2] Wikisource');
    const empty = researchBriefRequest('Woede', [meta('seneca')], [], 'o1');
    expect((empty.messages[0]!.content as string[])[1]).toContain('Geen fragmenten');
  });

  it('notitie als achtergrond: kern, feiten, invalshoeken en gecontroleerde citaten met bron', () => {
    expect(quoteSource(STORED_SOURCES[1]!)).toBe(
      'Lucius Annaeus Seneca, Of Anger/Book I (vertaald door Aubrey Stewart), via Wikisource',
    );
    const block = researchBlock({
      question: 'Woede',
      brief: BRIEF,
      sources: STORED_SOURCES,
      names: { seneca: 'Seneca' },
    });
    expect(block).toContain('KERN\nWoede is volgens de Stoa');
    expect(block).toContain('- Seneca: Stel je reactie uit.');
    // Alleen invalshoeken van bekende namen.
    expect(block).not.toContain('Vraag wat woede is.');
    expect(block).toContain('“Het beste is de eerste prikkels tot woede meteen af te wijzen” —');
    expect(block).toContain('KANTTEKENINGEN');
    const knowledge = researchBlock({
      question: 'Woede',
      brief: { ...BRIEF, basis: 'kennis', quotes: [] },
      sources: [],
      names: {},
    });
    expect(knowledge).toContain('alleen algemene kennis');
    expect(knowledge).not.toContain('CITATEN');
  });

  it('essay: lengte in woorden, leestips uit het eigen werk en het panel', () => {
    const text = essayInstruction({
      question: 'Woede',
      brief: BRIEF,
      sources: STORED_SOURCES,
      names: { seneca: 'Seneca', socrates: 'Socrates' },
      figure: figure('seneca'),
      length: 'lang',
      others: ['Socrates'],
      readerName: 'Sanne',
    });
    expect(text).toContain(`ongeveer ${RESEARCH.essayWords.lang} woorden`);
    expect(text).toContain('Ook Socrates dachten mee');
    expect(text).toContain('De lezer heet Sanne');
    expect(text).toContain(`LEESTIPS\n1. ${figure('seneca').keyWorks[0]!.title}`);
  });
});

/* ---------- Aanvragen, limiet en kosten ---------- */

const ctx = {
  hasClaudeKey: true,
  hasVoiceKey: false,
  // Seneca is een netwerkdenker: die ken je pas als je hem ontdekt hebt.
  known: new Set([...CORE_IDS, 'seneca']),
  remainingToday: 1,
};

describe('aanvragen', () => {
  const ok = {
    question: 'Hoe ga je om met woede?',
    figureIds: ['seneca'],
    first: { form: 'tekst' as const, figureId: 'seneca', length: 'kort' as const },
  };

  it('controleert sleutel, vraag, denkers, crisis, vorm en de daglimiet', () => {
    expect(researchProblem(ok, ctx)).toBeUndefined();
    expect(researchProblem(ok, { ...ctx, hasClaudeKey: false })).toBe('sleutel');
    expect(researchProblem({ ...ok, question: 'kort' }, ctx)).toBe('vraag');
    expect(researchProblem({ ...ok, question: 'x'.repeat(201) }, ctx)).toBe('vraag');
    expect(researchProblem({ ...ok, figureIds: [] }, ctx)).toBe('denkers');
    expect(
      researchProblem({ ...ok, figureIds: ['seneca', 'kant', 'socrates', 'laozi'] }, ctx),
    ).toBe('denkers');
    expect(researchProblem({ ...ok, figureIds: ['seneca', 'seneca'] }, ctx)).toBe('denkers');
    expect(researchProblem({ ...ok, figureIds: ['bestaat-niet'] }, ctx)).toBe('onbekend');
    expect(researchProblem({ ...ok, question: 'Ik wil niet meer leven' }, ctx)).toBe('crisis');
    expect(
      researchProblem({ ...ok, first: { form: 'tekst', figureId: 'kant', length: 'kort' } }, ctx),
    ).toBe('vorm');
    expect(researchProblem({ ...ok, first: { form: 'bellen', figureId: 'seneca' } }, ctx)).toBe(
      'stemsleutel',
    );
    expect(researchProblem(ok, { ...ctx, remainingToday: 0 })).toBe('limiet');
  });

  it('vormen: podcast-gesprek bij twee of drie denkers, college met de hoofddocent eerst', () => {
    expect(podcastFormats(1)).toEqual(['monoloog', 'interview']);
    expect(podcastFormats(3)).toEqual(['gesprek']);
    const figures = ['seneca', 'socrates', 'kant'];
    expect(draftRequest({ ...initialDraft('college'), figureId: 'kant' }, figures)).toEqual({
      form: 'college',
      figureIds: ['kant', 'seneca', 'socrates'],
    });
    expect(
      draftRequest({ ...initialDraft('podcast'), podcastFormat: 'monoloog' }, figures),
    ).toEqual({ form: 'podcast', figureIds: figures, format: 'gesprek', minutes: 10 });
    expect(draftRequest(initialDraft('tekst'), ['seneca'])).toEqual({
      form: 'tekst',
      figureId: 'seneca',
      length: 'kort',
    });
    expect(
      formProblem(
        { form: 'podcast', figureIds: ['seneca'], format: 'gesprek', minutes: 10 },
        ['seneca'],
        {
          elevenLabs: true,
        },
      ),
    ).toBe('vorm');
    expect(
      formProblem(
        { form: 'podcast', figureIds: ['seneca'], format: 'interview', minutes: 7 },
        ['seneca'],
        {
          elevenLabs: true,
        },
      ),
    ).toBe('vorm');
  });

  it('een nieuw onderzoek: zoeken, met de eerste vorm die wacht op het onderzoek', () => {
    const now = new Date(2026, 9, 18, 10, 0).getTime();
    const research = newResearch({ ...ok, question: '  Woede?  Hoe dan  ' }, now);
    expect(research).toMatchObject({
      day: '2026-10-18',
      question: 'Woede?  Hoe dan',
      status: 'zoeken',
      figureIds: ['seneca'],
      sources: [],
    });
    expect(research.outputs).toHaveLength(1);
    expect(research.outputs[0]).toMatchObject({ form: 'tekst', status: 'maken', length: 'kort' });
    // Bellen hoeft niet gemaakt te worden.
    expect(newOutput({ form: 'bellen', figureId: 'seneca' }, research.createdAt).status).toBe(
      'klaar',
    );
  });

  it('daglimiet: 1 per dag, Premium 3; oude tellerstanden zonder onderzoek tellen als 0', () => {
    expect(dailyLimit('research', 'basis')).toBe(1);
    expect(dailyLimit('research', 'premium')).toBe(3);
    const old = { '2026-10-18': { sessions: 1, lectures: 1 } };
    expect(remainingOn(old, 'basis', 'research', '2026-10-18')).toBe(1);
    const used = consume(old, 'basis', 'research', '2026-10-18');
    expect(used['2026-10-18']).toEqual({ sessions: 1, lectures: 1, research: 1 });
    expect(() => consume(used, 'basis', 'research', '2026-10-18')).toThrow(
      'maximale aantal onderwerpen',
    );
    expect(release(used, 'research', '2026-10-18')['2026-10-18']!.research).toBe(0);
    expect(release(old, 'research', '2026-10-18')['2026-10-18']!.research).toBe(0);
  });

  it('kosten in euro’s: uitzoeken plus de vorm; een extra vorm zonder het uitzoeken', () => {
    expect(researchEur()).toBeGreaterThan(0.02);
    expect(researchEur()).toBeLessThan(0.2);
    expect(essayEur('lang')).toBeGreaterThan(essayEur('kort'));
    const first = costLines({ form: 'tekst', figureId: 'seneca', length: 'kort' }, undefined, true);
    expect(first.map((l) => l.key)).toEqual(['uitzoeken', 'tekst']);
    expect(totalEur(first)).toBeCloseTo(researchEur() + essayEur('kort'));
    const podcast = costLines(
      { form: 'podcast', figureIds: ['seneca', 'kant'], format: 'gesprek', minutes: 10 },
      'eleven_v4',
      false,
    );
    expect(podcast.map((l) => `${l.key}:${l.service}`)).toEqual([
      'script:Claude',
      'voorlezen:ElevenLabs',
    ]);
    const call = costLines({ form: 'bellen', figureId: 'seneca' }, undefined, false);
    expect(call[0]!.eur).toBeCloseTo(RESEARCH.callMinutes * RESEARCH.callUsdPerMinute * 0.88);
  });
});

/* ---------- Bellen over een onderzoek ---------- */

describe('bellen over een onderzoek', () => {
  it('de rol krijgt de notitie mee; de opening noemt de AI-simulatie en de vraag', () => {
    const block = researchBlock({
      question: 'Woede',
      brief: BRIEF,
      sources: STORED_SOURCES,
      names: { seneca: 'Seneca' },
    });
    const prompt = buildCallPrompt({ figure: figure('seneca'), minutes: 10, research: block });
    expect(prompt).toContain('Vorm: een gesprek met de stem van 10 minuten.');
    expect(prompt).toContain('De student liet een onderwerp uitzoeken');
    expect(prompt).toContain('ONDERZOEK OP AANVRAAG');
    expect(buildCallPrompt({ figure: figure('seneca'), minutes: 10 })).not.toContain(
      'ONDERZOEK OP AANVRAAG',
    );

    // Een netwerkdenker zonder eigen stemontwerp: een neutrale begroeting.
    expect(researchFirstMessage(figure('seneca'), undefined, 'Omgaan met woede')).toBe(
      'Goedendag. Ik ben een AI-simulatie van Seneca. Ik heb me verdiept in je onderwerp: Omgaan met woede. Waar wil je beginnen?',
    );
    // Een kerndenker: de eerste zin van de eigen begroeting.
    const spec = voiceSpecFor('socrates')!;
    const first = researchFirstMessage(figure('socrates'), spec, 'Wat is moed?');
    expect(first.startsWith(spec.greeting.split(/(?<=[.!?])\s/)[0]!)).toBe(true);
    expect(first).toContain('Ik ben een AI-simulatie van Socrates.');
  });

  it('de stem: gekozen, anders ontworpen, anders een kant-en-klare bij het stemtype', async () => {
    useVoiceStore.setState(initialVoiceState());
    const api = {
      voiceExists: vi.fn(async () => true),
      libraryVoices: vi.fn(async () => [
        { voice_id: 'vrouw-1', name: 'Daphne', category: 'premade', labels: { gender: 'female' } },
        {
          voice_id: 'man-oud',
          name: 'Arthur',
          category: 'premade',
          labels: { gender: 'male', age: 'old' },
        },
      ]),
    } as unknown as ElevenLabsApi;

    // Seneca heeft geen eigen stem: een kant-en-klare mannenstem.
    expect(await researchCallVoice(api, 'sk_test_onderzoek_1', 'seneca')).toMatchObject({
      voiceId: 'man-oud',
      source: 'type',
    });
    // Een ontworpen stem gaat daarvoor.
    useVoiceStore.getState().setVoice('seneca', 'ontworpen-seneca');
    expect(await researchCallVoice(api, 'sk_test_onderzoek_1', 'seneca')).toMatchObject({
      voiceId: 'ontworpen-seneca',
      source: 'eigen',
    });
    // En een met "andere stem" gekozen stem gaat overal voor.
    useVoiceStore.getState().setOverride('seneca', 'vrouw-1', 'Daphne');
    expect(await researchCallVoice(api, 'sk_test_onderzoek_1', 'seneca')).toMatchObject({
      voiceId: 'vrouw-1',
      source: 'gekozen',
    });
    useVoiceStore.setState(initialVoiceState());
  });
});
