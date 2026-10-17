/**
 * Tekent de citaatkaart als PNG (1080 × 1350) in het thema van de denker, met naam, bron en het
 * label "AI-simulatie · Oudiency". De tekst is nooit als echt citaat gepresenteerd.
 */
import type { FigureMeta } from '@/data/figures';
import { t } from '@/i18n/nl';
import { DISPLAY_FONT_FAMILY } from '@/lib/fonts';
import { fitText, wrapText } from '@/lib/quoteCard';

const WIDTH = 1080;
const HEIGHT = 1350;
const MARGIN = 96;
const BODY_FONT = "'Literata Variable', Georgia, serif";
const INK = '#1e1a15';
const INK_SOFT = '#5a5146';

function monogram(meta: FigureMeta): string {
  if (meta.monogram) return meta.monogram;
  return meta.name
    .split(/\s+/)
    .filter((part) => /^\p{Lu}/u.test(part))
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}

async function fontsReady(display: string) {
  const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
  if (!fonts) return;
  const first = display.split(',')[0]?.trim() ?? 'serif';
  await Promise.allSettled([fonts.load(`64px ${first}`), fonts.load(`30px 'Literata Variable'`)]);
}

export async function renderQuoteCard(options: {
  passage: string;
  figure: FigureMeta;
  sourceLabel: string;
}): Promise<Blob> {
  const { passage, figure, sourceLabel } = options;
  const display = DISPLAY_FONT_FAMILY[figure.theme.displayFont];
  await fontsReady(display);
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is niet beschikbaar.');
  const { primary, accent, surface } = figure.theme;

  // Achtergrond en lijst.
  ctx.fillStyle = surface;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(40, 40, WIDTH - 80, HEIGHT - 80, 36);
  ctx.stroke();

  // Label bovenaan.
  ctx.fillStyle = primary;
  ctx.font = `600 28px ${BODY_FONT}`;
  ctx.letterSpacing = '4px';
  ctx.fillText(t.share.label.toUpperCase(), MARGIN, 140);
  ctx.letterSpacing = '0px';

  // Groot aanhalingsteken.
  ctx.fillStyle = accent;
  ctx.font = `220px ${display}`;
  ctx.fillText('“', MARGIN - 12, 380);

  // Het fragment, zo groot als past.
  ctx.fillStyle = primary;
  const box = { width: WIDTH - MARGIN * 2, height: 640 };
  const measure = (text: string, size: number) => {
    ctx.font = `${size}px ${display}`;
    return ctx.measureText(text).width;
  };
  const { size, lines } = fitText(measure, passage, box, [76, 68, 62, 56, 50, 46, 42]);
  ctx.font = `${size}px ${display}`;
  const lineHeight = size * 1.25;
  let y = 420 + size;
  for (const line of lines) {
    ctx.fillText(line, MARGIN, y);
    y += lineHeight;
  }

  // Naam en bron.
  y = Math.max(y + 40, 1080);
  ctx.font = `600 46px ${display}`;
  ctx.fillText(`— ${figure.name}`, MARGIN, y);
  ctx.fillStyle = INK_SOFT;
  ctx.font = `30px ${BODY_FONT}`;
  for (const line of wrapText((s) => ctx.measureText(s).width, sourceLabel, box.width - 160)) {
    y += 44;
    ctx.fillText(line, MARGIN, y);
  }

  // Monogram rechtsonder.
  const cx = WIDTH - MARGIN - 50;
  const cy = HEIGHT - MARGIN - 70;
  ctx.fillStyle = surface;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = primary;
  ctx.font = `40px ${display}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(monogram(figure), cx, cy + 2);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  // Disclaimer onderaan.
  ctx.fillStyle = INK;
  ctx.font = `italic 26px ${BODY_FONT}`;
  ctx.fillText(t.share.cardDisclaimer, MARGIN, HEIGHT - MARGIN - 10);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('De kaart kon niet worden gemaakt.'))),
      'image/png',
    );
  });
}
