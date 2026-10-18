/**
 * Wikipedia en Wikisource (Engels) via de MediaWiki-API, rechtstreeks vanuit de browser: anoniem
 * met `origin=*` (CORS), zonder sleutel of extra headers. Er gaan alleen zoektermen en
 * paginatitels heen. Lazy geladen met de rest van het onderzoek.
 */
import { z } from 'zod';
import { RESEARCH } from '@/config/research';
import { extractParagraphs, type Paragraph } from './passages';

export type WikiSite = keyof typeof RESEARCH.sites;

export interface WikiHit {
  site: WikiSite;
  title: string;
}

export interface WikiPage {
  site: WikiSite;
  title: string;
  url: string;
  /** Wikisource: de auteur (en vertaler) volgens de kop van de tekst. */
  author?: string;
  translator?: string;
  paragraphs: Paragraph[];
}

export class WikiError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'WikiError';
  }
}

/** De leesbare link naar een pagina (spaties als liggend streepje, '/' en ':' leesbaar). */
export function pageUrl(site: WikiSite, title: string): string {
  const path = encodeURIComponent(title.replace(/ /g, '_'))
    .replace(/%2F/g, '/')
    .replace(/%3A/g, ':');
  return `${RESEARCH.sites[site]}/wiki/${path}`;
}

export function apiUrl(site: WikiSite, params: Record<string, string>): string {
  const query = new URLSearchParams({
    ...params,
    format: 'json',
    formatversion: '2',
    origin: '*',
  });
  return `${RESEARCH.sites[site]}/w/api.php?${query.toString()}`;
}

async function getJson(url: string, signal?: AbortSignal): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), RESEARCH.fetchTimeoutMs);
  const forward = () => controller.abort();
  signal?.addEventListener('abort', forward, { once: true });
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) throw new WikiError(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    const failure = ApiErrorSchema.safeParse(data);
    if (failure.success) throw new WikiError(failure.data.error.info ?? failure.data.error.code);
    return data;
  } catch (error) {
    throw error instanceof WikiError ? error : new WikiError('Niet bereikbaar.', { cause: error });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forward);
  }
}

const ApiErrorSchema = z.object({
  error: z.object({ code: z.string(), info: z.string().optional() }),
});

const SearchSchema = z.object({
  query: z.object({
    search: z.array(z.object({ title: z.string() })),
  }),
});

/** Overzichts- en doorverwijspagina's leveren geen inhoud op. */
const NOT_CONTENT = /\((disambiguation|disambiguation page)\)$|^List of /i;

/** Zoek pagina's (hoofdnaamruimte: artikelen of teksten). */
export async function searchWiki(
  site: WikiSite,
  query: string,
  limit: number,
  signal?: AbortSignal,
): Promise<WikiHit[]> {
  const data = SearchSchema.safeParse(
    await getJson(
      apiUrl(site, {
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: String(limit),
        srnamespace: '0',
        srprop: '',
      }),
      signal,
    ),
  );
  if (!data.success) throw new WikiError('Onverwacht antwoord van de zoekfunctie.');
  return data.data.query.search
    .filter((hit) => !NOT_CONTENT.test(hit.title))
    .map((hit) => ({ site, title: hit.title }));
}

const ExtractSchema = z.object({
  query: z.object({
    pages: z.array(
      z.object({
        title: z.string(),
        missing: z.boolean().optional(),
        extract: z.string().optional(),
      }),
    ),
  }),
});

/** Een Wikipedia-artikel als platte tekst (TextExtracts: per aanvraag één volledige pagina). */
export async function wikipediaPage(
  title: string,
  signal?: AbortSignal,
): Promise<WikiPage | undefined> {
  const data = ExtractSchema.safeParse(
    await getJson(
      apiUrl('wikipedia', {
        action: 'query',
        prop: 'extracts',
        explaintext: '1',
        redirects: '1',
        titles: title,
      }),
      signal,
    ),
  );
  if (!data.success) throw new WikiError('Onverwacht antwoord bij een artikel.');
  const page = data.data.query.pages[0];
  if (!page || page.missing || !page.extract) return undefined;
  return {
    site: 'wikipedia',
    title: page.title,
    url: pageUrl('wikipedia', page.title),
    paragraphs: extractParagraphs(page.extract),
  };
}

const ParseSchema = z.object({
  parse: z.object({ title: z.string(), text: z.string() }),
});

/** Een tekst op Wikisource: de opgemaakte pagina, teruggebracht tot alinea's en de auteur. */
export async function wikisourcePage(
  title: string,
  signal?: AbortSignal,
): Promise<WikiPage | undefined> {
  const data = ParseSchema.safeParse(
    await getJson(
      apiUrl('wikisource', {
        action: 'parse',
        page: title,
        prop: 'text',
        redirects: '1',
        disablelimitreport: '1',
        disableeditsection: '1',
      }),
      signal,
    ),
  );
  if (!data.success) throw new WikiError('Onverwacht antwoord bij een tekst.');
  const parsed = parseWikisourceHtml(data.data.parse.text);
  if (parsed.paragraphs.length === 0) return undefined;
  return {
    site: 'wikisource',
    title: data.data.parse.title,
    url: pageUrl('wikisource', data.data.parse.title),
    ...parsed,
  };
}

/** Kop, voetnoten, paginanummers en andere randzaken die geen deel van de tekst zijn. */
const NOT_TEXT = [
  'style',
  'script',
  'table',
  'sup.reference',
  'ol.references',
  '.mw-references-wrap',
  '.mw-editsection',
  '.ws-noexport',
  '.wst-header',
  '.ws-header',
  '#headertemplate',
  '.noprint',
  '.pagenum',
  '.ws-pagenum',
  '.licenseContainer',
  '.wst-license',
  '.navbox',
].join(',');

const squash = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();

/**
 * Stijlblokken en style-attributen eruit vóór het parsen: ook in een document van DOMParser geldt
 * onze CSP (style-src 'self'), en elk inline-stijltje zou een melding in de console geven.
 */
export function withoutInlineStyles(html: string): string {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/\sstyle\s*=\s*("[^"]*"|'[^']*')/gi, '');
}

/**
 * De HTML van een Wikisource-pagina als alinea's. Auteur en vertaler komen uit de microformat-
 * gegevens van de kop (`#ws-author`, `#ws-translator`), anders uit de eerste link naar een
 * auteurspagina. Lees ze vóór het opruimen: die gegevens staan in een `.ws-noexport`-blok.
 */
export function parseWikisourceHtml(
  html: string,
  minLength = 40,
): { author?: string; translator?: string; paragraphs: Paragraph[] } {
  const doc = new DOMParser().parseFromString(withoutInlineStyles(html), 'text/html');
  const author =
    squash(doc.querySelector('#ws-author')?.textContent) ||
    squash(doc.querySelector('a[href*="/wiki/Author:"]')?.textContent) ||
    undefined;
  const translator = squash(doc.querySelector('#ws-translator')?.textContent) || undefined;
  doc.querySelectorAll(NOT_TEXT).forEach((node) => node.remove());
  const paragraphs = [...doc.querySelectorAll('p, dd')]
    // Een <dd> met eigen alinea's zou dubbel tellen.
    .filter((node) => node.tagName !== 'DD' || !node.querySelector('p'))
    .map((node) => squash(node.textContent))
    .filter((text) => text.length >= minLength)
    .map((text) => ({ section: '', text }));
  return { author, translator, paragraphs };
}
