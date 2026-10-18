/**
 * Bronnen verzamelen: per zoekterm de beste treffers, dan de pagina's zelf, en daaruit de stukken
 * die bij de vraag horen. Faalt er iets (offline, geblokkeerd), dan gaat het onderzoek verder met
 * wat er wel is; zonder bronnen werkt Claude alleen met eigen kennis (keuze 4c).
 */
import type { SourceText } from '@/ai/prompts/research';
import { RESEARCH } from '@/config/research';
import { passagesText, searchTerms, selectPassages } from './passages';
import { searchWiki, type WikiPage, type WikiSite, wikipediaPage, wikisourcePage } from './wiki';

export interface WikiClient {
  search: (site: WikiSite, query: string, limit: number) => Promise<{ title: string }[]>;
  page: (site: WikiSite, title: string) => Promise<WikiPage | undefined>;
}

export const liveWiki: WikiClient = {
  search: (site, query, limit) => searchWiki(site, query, limit),
  page: (site, title) => (site === 'wikipedia' ? wikipediaPage(title) : wikisourcePage(title)),
};

export interface SourcePlan {
  wikipedia: readonly string[];
  wikisource: readonly string[];
}

function uniqueQueries(queries: readonly string[], max: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const query of queries) {
    const clean = query.trim().replace(/\s+/g, ' ').slice(0, 80);
    const key = clean.toLowerCase();
    if (!clean || seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }
  return result.slice(0, max);
}

/** Om en om uit elke zoekopdracht (eerste treffers eerst), zonder dubbele titels. */
export function interleave(lists: readonly (readonly string[])[], max: number): string[] {
  const titles: string[] = [];
  const longest = Math.max(0, ...lists.map((list) => list.length));
  for (let i = 0; i < longest && titles.length < max; i++) {
    for (const list of lists) {
      const title = list[i];
      if (title && !titles.includes(title) && titles.length < max) titles.push(title);
    }
  }
  return titles;
}

async function titlesFor(
  client: WikiClient,
  site: WikiSite,
  queries: readonly string[],
): Promise<string[]> {
  const results = await Promise.allSettled(
    queries.map((query) => client.search(site, query, RESEARCH.searchResults)),
  );
  const lists = results.map((result) =>
    result.status === 'fulfilled' ? result.value.map((hit) => hit.title) : [],
  );
  return interleave(lists, RESEARCH.maxArticles[site]);
}

/** Zoek, lees en kies; de volgorde is: Wikipedia-artikelen, dan Wikisource-teksten. */
export async function gatherSources(
  plan: SourcePlan,
  names: readonly string[],
  client: WikiClient = liveWiki,
): Promise<SourceText[]> {
  const queries = {
    wikipedia: uniqueQueries(plan.wikipedia, RESEARCH.maxQueries.wikipedia),
    wikisource: uniqueQueries(plan.wikisource, RESEARCH.maxQueries.wikisource),
  };
  const terms = searchTerms([...queries.wikipedia, ...queries.wikisource, ...names]);
  const [wikipediaTitles, wikisourceTitles] = await Promise.all([
    titlesFor(client, 'wikipedia', queries.wikipedia),
    titlesFor(client, 'wikisource', queries.wikisource),
  ]);
  const wanted: { site: WikiSite; title: string }[] = [
    ...wikipediaTitles.map((title) => ({ site: 'wikipedia' as const, title })),
    ...wikisourceTitles.map((title) => ({ site: 'wikisource' as const, title })),
  ];
  const pages = await Promise.allSettled(wanted.map(({ site, title }) => client.page(site, title)));

  const sources: SourceText[] = [];
  const seen = new Set<string>();
  for (const result of pages) {
    if (result.status !== 'fulfilled' || !result.value) continue;
    const page = result.value;
    if (seen.has(page.url)) continue;
    seen.add(page.url);
    // Van een tekst op Wikisource alleen wat over de vraag gaat; van een artikel ook de inleiding.
    const passages = selectPassages(
      page.paragraphs,
      terms,
      RESEARCH.charsPerArticle[page.site],
      page.site === 'wikipedia',
    );
    const text = passagesText(passages);
    if (!text) continue;
    sources.push({
      kind: page.site,
      title: page.title,
      url: page.url,
      ...(page.author ? { author: page.author } : {}),
      ...(page.translator ? { translator: page.translator } : {}),
      text,
    });
  }
  return sources;
}
