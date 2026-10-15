/**
 * Genereert de statische merkbestanden in public/: favicon.svg, app-iconen (PNG), het
 * webmanifest en de social-preview (og-image.png, 1200×630).
 *
 * Draai opnieuw als de (werk)titel of de huisstijl verandert:
 *   npm run gen:assets
 *
 * Vereist Playwright met Chromium (niet nodig voor de gewone build/CI):
 *   npx -y playwright@1.56 install chromium   (of een globale `playwright`)
 */
import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { APP } from '../src/config/app';
import { FIGURE_INDEX } from '../src/data/figures/index.generated';
import { monogramFor } from '../src/lib/monogram';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = (file: string) => join(root, 'public', file);
const nm = (file: string) => join(root, 'node_modules', file);

const C = {
  paper: '#f6f0e4',
  paper2: '#ede4d3',
  card: '#fffcf5',
  ink: '#1e1a15',
  ink2: '#463e33',
  gold: '#7f5c12',
  goldBright: '#b08a3e',
  goldSoft: '#e9d9b0',
};

/* ---------- Logo (zelfde merkteken als in de app-header) ---------- */

function logoMark(size: number): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="${size}" height="${size}">
  <circle cx="20" cy="20" r="19" fill="${C.gold}"/>
  <circle cx="20" cy="20" r="17" fill="${C.paper}"/>
  <circle cx="20" cy="20" r="12.5" fill="none" stroke="${C.ink}" stroke-width="2.2"/>
  <path d="M20 7.5v25M7.5 20h25" stroke="${C.gold}" stroke-width="1"/>
  <circle cx="20" cy="20" r="3" fill="${C.ink}"/>
</svg>`;
}

/** Favicon: iets dikkere lijnen, zodat het merkteken op 16 px leesbaar blijft. */
const FAVICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">
  <circle cx="20" cy="20" r="19.5" fill="${C.gold}"/>
  <circle cx="20" cy="20" r="17" fill="${C.paper}"/>
  <circle cx="20" cy="20" r="11.5" fill="none" stroke="${C.ink}" stroke-width="3.2"/>
  <path d="M20 6v28M6 20h28" stroke="${C.gold}" stroke-width="1.6"/>
  <circle cx="20" cy="20" r="3.6" fill="${C.ink}"/>
</svg>
`;

/* ---------- Lettertypen als data-URL (file:// mag geen fonts laden zonder CORS) ---------- */

function dataUrl(path: string): string {
  return `data:font/woff2;base64,${readFileSync(path).toString('base64')}`;
}

/** Zoekt in een fontsource-CSS het subsetbestand waarvan de unicode-range `char` bevat. */
function subsetFor(cssPath: string, char: string): string {
  const css = readFileSync(cssPath, 'utf8');
  const code = char.codePointAt(0) ?? 0;
  for (const block of css.split('@font-face').slice(1)) {
    const file = /url\(\.\/files\/([^)]+\.woff2)\)/.exec(block)?.[1];
    const range = /unicode-range:\s*([^;]+);/.exec(block)?.[1];
    if (!file || !range) continue;
    const hit = range.split(',').some((part) => {
      const [a, b] = part.trim().replace(/^U\+/i, '').split('-');
      const lo = parseInt(a ?? '', 16);
      const hi = b ? parseInt(b, 16) : lo;
      return code >= lo && code <= hi;
    });
    if (hit) return join(dirname(cssPath), 'files', file);
  }
  throw new Error(`Geen subset met ${char} in ${cssPath}`);
}

const FONT_CSS = `
@font-face { font-family: 'Cormorant'; font-weight: 300 700; src: url(${dataUrl(nm('@fontsource-variable/cormorant-garamond/files/cormorant-garamond-latin-wght-normal.woff2'))}) format('woff2'); }
@font-face { font-family: 'Literata'; font-weight: 200 900; src: url(${dataUrl(nm('@fontsource-variable/literata/files/literata-latin-wght-normal.woff2'))}) format('woff2'); }
@font-face { font-family: 'EBGaramond'; font-weight: 400 800; src: url(${dataUrl(nm('@fontsource-variable/eb-garamond/files/eb-garamond-greek-wght-normal.woff2'))}) format('woff2'); unicode-range: U+0370-03FF; }
@font-face { font-family: 'NotoSC'; font-weight: 600; src: url(${dataUrl(subsetFor(nm('@fontsource/noto-serif-sc/600.css'), '老'))}) format('woff2'); }
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { background: transparent; }
`;

/* ---------- Medaillons van de kerndenkers (zoals de avatars in de app) ---------- */

function medallion(id: string, size: number): string {
  const meta = FIGURE_INDEX.find((m) => m.id === id);
  if (!meta) throw new Error(`Onbekende denker ${id}`);
  const monogram = monogramFor(meta);
  const native = [...monogram].some((ch) => (ch.codePointAt(0) ?? 0) > 0x24f);
  const family = native ? "'EBGaramond', 'NotoSC', serif" : "'Cormorant', serif";
  const fontSize = monogram.length >= 3 ? 24 : monogram.length === 2 ? 30 : 40;
  const { primary, accent, surface } = meta.theme;
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-label="${meta.name}">
    <circle cx="50" cy="50" r="48" fill="${accent}" opacity="0.9"/>
    <circle cx="50" cy="50" r="45.5" fill="${surface}"/>
    <circle cx="50" cy="50" r="43" fill="none" stroke="${primary}" stroke-width="0.8" opacity="0.6"/>
    <text x="50" y="50" dy="0.35em" text-anchor="middle" fill="${primary}"
      style="font-family:${family};font-size:${fontSize}px;font-weight:600;letter-spacing:${monogram.length > 1 ? '0.02em' : '0'}">${monogram}</text>
  </svg>`;
}

const CORE_ORDER = [
  'socrates',
  'laozi',
  'aurelius',
  'spinoza',
  'rousseau',
  'franklin',
  'kant',
  'gandhi',
];

const OG_HTML = `<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>${FONT_CSS}
body { width: 1200px; height: 630px; background: ${C.paper}; font-family: 'Literata', Georgia, serif; color: ${C.ink}; position: relative; overflow: hidden; }
.bg { position: absolute; inset: 0; background:
  radial-gradient(900px 500px at 85% 0%, ${C.goldSoft}88, transparent 60%),
  radial-gradient(700px 400px at 0% 100%, ${C.paper2}, transparent 70%); }
.frame { position: absolute; inset: 22px; border: 1.5px solid ${C.gold}66; border-radius: 28px; }
.content { position: absolute; left: 84px; top: 74px; right: 84px; }
.brand { display: flex; align-items: center; gap: 26px; }
h1 { font-family: 'Cormorant', serif; font-weight: 600; font-size: 132px; line-height: 0.9; letter-spacing: -0.01em; }
.tagline { margin-top: 26px; font-size: 38px; color: ${C.ink2}; font-weight: 450; }
.desc { margin-top: 14px; font-size: 26px; color: ${C.ink2}; max-width: 900px; line-height: 1.4; }
.pill { position: absolute; right: 84px; top: 80px; border: 2px solid ${C.ink}; border-radius: 999px; padding: 8px 20px; font-size: 22px; font-weight: 600; letter-spacing: 0.04em; background: ${C.card}; }
.row { position: absolute; left: 84px; right: 84px; bottom: 70px; display: flex; gap: 22px; }
</style></head><body>
<div class="bg"></div><div class="frame"></div>
<div class="pill">${APP.aiLabel}</div>
<div class="content">
  <div class="brand">${logoMark(112)}<h1>${APP.name}</h1></div>
  <p class="tagline">${APP.tagline}</p>
  <p class="desc">Gesprekken, colleges en een timeline met grote denkers uit de geschiedenis — in het Nederlands.</p>
</div>
<div class="row">${CORE_ORDER.map((id) => medallion(id, 106)).join('')}</div>
</body></html>`;

function iconHtml(size: number, opts: { padding: number; background: string | null }): string {
  const inner = Math.round(size * (1 - 2 * opts.padding));
  return `<!doctype html><html><head><meta charset="utf-8"><style>${FONT_CSS}
body { width: ${size}px; height: ${size}px; display: grid; place-items: center; background: ${opts.background ?? 'transparent'}; }
</style></head><body>${logoMark(inner)}</body></html>`;
}

const MANIFEST = {
  name: `${APP.name} — ${APP.tagline}`,
  short_name: APP.name,
  description:
    'Gesprekken, colleges en een timeline met grote denkers uit de geschiedenis. Een AI-simulatie, in het Nederlands.',
  lang: 'nl',
  dir: 'ltr',
  start_url: './',
  scope: './',
  display: 'standalone',
  background_color: C.paper,
  theme_color: C.paper,
  icons: [
    { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
    { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
  ],
};

/* ---------- Playwright laden (project-dependency óf globaal geïnstalleerd) ---------- */

type Browser = { newPage(o: object): Promise<Page>; close(): Promise<void> };
type Page = {
  setContent(html: string, o?: object): Promise<void>;
  evaluate<T>(fn: () => T): Promise<T>;
  screenshot(o: object): Promise<Buffer>;
  close(): Promise<void>;
};

async function launch(): Promise<Browser> {
  const require = createRequire(import.meta.url);
  let pw: { chromium: { launch(): Promise<Browser> } };
  try {
    pw = require('playwright');
  } catch {
    const globalRoot = execSync('npm root -g').toString().trim();
    pw = require(join(globalRoot, 'playwright'));
  }
  return pw.chromium.launch();
}

async function render(
  browser: Browser,
  html: string,
  width: number,
  height: number,
  transparent: boolean,
) {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready.then(() => true));
  const png = await page.screenshot({ type: 'png', omitBackground: transparent });
  await page.close();
  return png;
}

const browser = await launch();
try {
  writeFileSync(pub('favicon.svg'), FAVICON);
  writeFileSync(pub('manifest.webmanifest'), `${JSON.stringify(MANIFEST, null, 2)}\n`);
  writeFileSync(
    pub('icon-192.png'),
    await render(browser, iconHtml(192, { padding: 0.02, background: null }), 192, 192, true),
  );
  writeFileSync(
    pub('icon-512.png'),
    await render(browser, iconHtml(512, { padding: 0.02, background: null }), 512, 512, true),
  );
  // Maskable: het merkteken binnen de veilige zone (80% cirkel), rondom papierkleur.
  writeFileSync(
    pub('icon-maskable-512.png'),
    await render(browser, iconHtml(512, { padding: 0.17, background: C.paper }), 512, 512, false),
  );
  // iOS: geen transparantie; iOS rondt de hoeken zelf af.
  writeFileSync(
    pub('apple-touch-icon.png'),
    await render(browser, iconHtml(180, { padding: 0.1, background: C.paper }), 180, 180, false),
  );
  writeFileSync(pub('og-image.png'), await render(browser, OG_HTML, 1200, 630, false));
  console.log('Merkbestanden geschreven naar public/.');
} finally {
  await browser.close();
}
