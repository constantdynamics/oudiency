/**
 * Beperkte, veilige markdown voor AI-tekst: alinea's, regeleinden, **vet**, *cursief*,
 * lijstjes, eenvoudige kopjes en citaatblokken. Er komt nooit HTML uit: de parser levert
 * een boom op die <RichText> als gewone React-elementen rendert (React escapet alle tekst).
 * Links worden bewust als platte tekst getoond.
 */

export type Inline =
  | { type: 'text'; text: string }
  | { type: 'break' }
  | { type: 'strong'; children: Inline[] }
  | { type: 'em'; children: Inline[] };

export type Block =
  | { type: 'paragraph'; children: Inline[] }
  | { type: 'heading'; children: Inline[] }
  | { type: 'list'; ordered: boolean; items: Inline[][] }
  | { type: 'quote'; children: Inline[] };

const UL_RE = /^\s*[-*•]\s+(.*)$/;
const OL_RE = /^\s*\d{1,3}[.)]\s+(.*)$/;
const HEADING_RE = /^\s*#{1,6}\s+(.*)$/;
const QUOTE_RE = /^\s*>\s?(.*)$/;
const RULE_RE = /^\s*([-*_])(\s*\1){2,}\s*$/;

/**
 * Sluit tijdens het streamen een nog openstaande ** of * af, zodat half binnengekomen
 * opmaak niet even als losse sterretjes in beeld staat.
 */
export function closeOpenMarkers(text: string): string {
  let out = text;
  const doubles = (out.match(/\*\*/g) ?? []).length;
  if (doubles % 2 === 1) out = out.endsWith('**') ? out.slice(0, -2) : `${out}**`;
  const withoutDoubles = out.replace(/\*\*/g, '');
  let singles = 0;
  for (let i = 0; i < withoutDoubles.length; i++) {
    if (withoutDoubles[i] !== '*') continue;
    const before = withoutDoubles[i - 1];
    const after = withoutDoubles[i + 1];
    const spaceBefore = before === undefined || /\s/.test(before);
    const spaceAfter = after === undefined || /\s/.test(after);
    if (!(spaceBefore && spaceAfter)) singles++;
  }
  if (singles % 2 === 1) out = out.endsWith('*') ? out.slice(0, -1) : `${out}*`;
  return out;
}

export function parseMarkdown(source: string): Block[] {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  let quote: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'paragraph', children: parseInlineLines(paragraph) });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list) {
      blocks.push({
        type: 'list',
        ordered: list.ordered,
        items: list.items.map((item) => parseInline(item)),
      });
      list = null;
    }
  };
  const flushQuote = () => {
    if (quote.length > 0) {
      blocks.push({ type: 'quote', children: parseInlineLines(quote) });
      quote = [];
    }
  };
  const flushAll = () => {
    flushParagraph();
    flushList();
    flushQuote();
  };

  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+$/, '');
    if (line.trim() === '') {
      flushAll();
      continue;
    }
    if (RULE_RE.test(line)) {
      flushAll();
      continue;
    }
    const heading = HEADING_RE.exec(line);
    if (heading) {
      flushAll();
      blocks.push({ type: 'heading', children: parseInline(heading[1] ?? '') });
      continue;
    }
    const ul = UL_RE.exec(line);
    const ol = ul ? null : OL_RE.exec(line);
    if (ul || ol) {
      flushParagraph();
      flushQuote();
      const ordered = Boolean(ol);
      const content = (ul ?? ol)?.[1] ?? '';
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(content);
      continue;
    }
    const q = QUOTE_RE.exec(line);
    if (q) {
      flushParagraph();
      flushList();
      quote.push(q[1] ?? '');
      continue;
    }
    if (list && /^\s{2,}\S/.test(rawLine)) {
      // vervolgregel van een lijstitem
      const items: string[] = (list as { items: string[] }).items;
      items[items.length - 1] = `${items[items.length - 1] ?? ''} ${line.trim()}`;
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(line.trim());
  }
  flushAll();
  return blocks;
}

function parseInlineLines(lines: string[]): Inline[] {
  const out: Inline[] = [];
  lines.forEach((line, index) => {
    if (index > 0) out.push({ type: 'break' });
    out.push(...parseInline(line));
  });
  return out;
}

/** Strip markdown-links en inline code tot platte tekst. */
function simplify(text: string): string {
  return text.replace(/\[([^\]]+)\]\((?:[^()]|\([^()]*\))*\)/g, '$1').replace(/`([^`]+)`/g, '$1');
}

export function parseInline(source: string): Inline[] {
  return parseInlineRaw(simplify(source));
}

function isWordChar(ch: string | undefined): boolean {
  return ch !== undefined && /[\p{L}\p{N}]/u.test(ch);
}

function parseInlineRaw(text: string): Inline[] {
  const out: Inline[] = [];
  let buffer = '';
  let i = 0;

  const pushText = () => {
    if (buffer) {
      const last = out[out.length - 1];
      if (last && last.type === 'text') last.text += buffer;
      else out.push({ type: 'text', text: buffer });
      buffer = '';
    }
  };

  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    // **vet** of __vet__
    if ((ch === '*' && next === '*') || (ch === '_' && next === '_' && !isWordChar(text[i - 1]))) {
      const marker = ch + ch;
      const close = text.indexOf(marker, i + 2);
      if (close > i + 2) {
        pushText();
        out.push({ type: 'strong', children: parseInlineRaw(text.slice(i + 2, close)) });
        i = close + 2;
        continue;
      }
    }

    // *cursief* of _cursief_
    if ((ch === '*' || ch === '_') && next !== undefined && next !== ' ' && next !== ch) {
      const opensWord = ch === '*' || !isWordChar(text[i - 1]);
      if (opensWord) {
        let close = -1;
        for (let j = i + 1; j < text.length; j++) {
          if (text[j] === ch && text[j + 1] !== ch && text[j - 1] !== ' ' && text[j - 1] !== ch) {
            if (ch === '_' && isWordChar(text[j + 1])) continue;
            close = j;
            break;
          }
        }
        if (close > i + 1) {
          pushText();
          out.push({ type: 'em', children: parseInlineRaw(text.slice(i + 1, close)) });
          i = close + 1;
          continue;
        }
      }
    }

    buffer += ch;
    i++;
  }
  pushText();
  return out;
}

/** Platte tekst uit markdown (voor samenvattingen, citaatkaarten, schermlezers). */
export function markdownToPlainText(source: string): string {
  const blocks = parseMarkdown(source);
  const inlineText = (nodes: Inline[]): string =>
    nodes
      .map((node) => {
        if (node.type === 'text') return node.text;
        if (node.type === 'break') return '\n';
        return inlineText(node.children);
      })
      .join('');
  return blocks
    .map((block) => {
      if (block.type === 'list') {
        return block.items
          .map((item, index) => `${block.ordered ? `${index + 1}.` : '•'} ${inlineText(item)}`)
          .join('\n');
      }
      return inlineText(block.children);
    })
    .join('\n\n');
}
