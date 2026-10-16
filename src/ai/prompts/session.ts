/**
 * Prompts voor een getypte sessie (§8.2): kader + persona (beide cachebaar), sessieregels en
 * context, en per beurt een tijdregel in het laatste gebruikersbericht (niet gecachet).
 */
import type { Figure } from '@/data/types';
import type { Message } from '@/store/schemas';
import type { ChatMessage, SystemBlock, TextRequest } from '../provider';
import type { DemoContext } from '../demoContext';
import { FRAME } from './frame';
import { buildPersona } from './persona';

export const SESSION_RULES = `SESSIE
- Dit is een persoonlijk gesprek van een kwartier met één student, in een chat. Spreek de student aan met "je".
- Adaptieve diepgang, zonder vaste niveaus: begin toegankelijk en ga dieper naarmate de student dieper gaat (langere, reflectievere berichten, doorvragen op begrippen). Haakt de student af, ga dan terug naar eenvoud. Een snelle vraag krijgt een kort antwoord; een diep gesprek mag diep gaan.
- Lengte: 60 tot 150 woorden per beurt, tenzij de student om meer vraagt. Stel hooguit één vraag per beurt.
- Elke beurt van de student eindigt met een tijdregel tussen vierkante haken, zoals [beurt 7 · verstreken 9:40 · resterend 5:20]. Bij 3 minuten of minder resterend rond je kernachtig af; bij 1 minuut of minder geef je een slotgedachte. Noem de tijdregel nooit letterlijk.
- Een bericht tussen vierkante haken dat met "App:" begint, komt van de app (bijvoorbeeld de binnenkomst van de student); reageer erop zoals gevraagd, zonder het te citeren.`;

export interface SessionContext {
  figure: Figure;
  studentName?: string;
  topicHint?: string;
  /** Samenvattingen van eerdere sessies met deze denker (meest recente eerst). */
  memory?: readonly string[];
}

export function sessionContextBlock({ studentName, topicHint, memory }: SessionContext): string {
  const lines = ['SESSIECONTEXT'];
  const name = studentName?.trim();
  lines.push(
    name
      ? `- De student wil ${name} genoemd worden. Doe dat af en toe, niet in elk bericht.`
      : '- De student heeft geen naam opgegeven.',
  );
  const topic = topicHint?.trim();
  if (topic) lines.push(`- Bij het boeken schreef de student waarover het moet gaan: ${topic}`);
  if (memory && memory.length > 0) {
    lines.push('- Eerdere gesprekken met deze student (samenvattingen, meest recente eerst):');
    for (const summary of memory) lines.push(`  - ${summary.trim()}`);
    lines.push(
      '  Verwijs er waar het past naar ("Vorige keer spraken we over …"), maar herhaal ze niet.',
    );
  } else {
    lines.push('- Dit is jullie eerste gesprek.');
  }
  return lines.join('\n');
}

export function sessionSystem(context: SessionContext): SystemBlock[] {
  return [
    { text: FRAME, cache: true },
    { text: buildPersona(context.figure), cache: true },
    { text: `${SESSION_RULES}\n\n${sessionContextBlock(context)}`, cache: true },
  ];
}

/** Het verborgen app-bericht waarmee de student binnenkomt. */
export function arrivalText(hasMemory: boolean, topicHint?: string): string {
  const topic = topicHint?.trim();
  return [
    `[App: De student komt binnen voor de afspraak. Begroet hem of haar kort en warm in je eigen stijl${
      hasMemory ? ', en knoop kort aan bij jullie vorige gesprek' : ''
    }.`,
    topic
      ? ` Vraag door op wat de student bij het boeken schreef.]`
      : ' Vraag waarover de student wil praten.]',
  ].join('');
}

/**
 * Het gesprek als berichten voor het model: de student (en verborgen app-berichten) als `user`,
 * de denker als `assistant`, opeenvolgende berichten van dezelfde kant samengevoegd. De tijdregel
 * gaat als apart blok mee in het laatste gebruikersbericht.
 */
export function sessionMessages(messages: readonly Message[], timeContext?: string): ChatMessage[] {
  const result: ChatMessage[] = [];
  for (const message of messages) {
    if (message.error) continue;
    let role: ChatMessage['role'] | undefined;
    if (message.role === 'figure') role = 'assistant';
    else if (message.role === 'user' || message.hidden) role = 'user';
    if (!role || !message.text.trim()) continue;
    const text =
      message.role === 'user' && message.timeContext
        ? [message.text, message.timeContext]
        : [message.text];
    const last = result[result.length - 1];
    if (last && last.role === role) {
      const previous = Array.isArray(last.content) ? last.content : [last.content];
      last.content = [...previous, ...text];
    } else {
      result.push({ role, content: text.length === 1 ? text[0]! : text });
    }
  }
  if (timeContext) {
    const last = result[result.length - 1];
    if (last?.role === 'user') {
      const previous = Array.isArray(last.content) ? last.content : [last.content];
      if (!previous.includes(timeContext)) last.content = [...previous, timeContext];
    }
  }
  return result;
}

export function sessionRequest(
  context: SessionContext,
  messages: readonly Message[],
  demo: DemoContext,
  timeContext?: string,
): TextRequest {
  return {
    task: 'session',
    system: sessionSystem(context),
    messages: sessionMessages(messages, timeContext),
    demo,
  };
}

export const SUMMARY_TASK = `TAAK: SAMENVATTING
Vat het gesprek hieronder samen voor de afspraakgeschiedenis van de student.
- summary: 3 tot 5 zinnen, in de tweede persoon ("je"), feitelijk over waar het over ging en wat er duidelijker werd. Geen citaten.
- reflectionQuestion: één vraag om mee te nemen, in de stijl van de denker.
- topics: één tot drie korte onderwerpen (één of twee woorden).`;

/** Het gesprek als leesbare tekst voor de samenvatting. */
export function transcriptText(messages: readonly Message[], figureName: string): string {
  return messages
    .filter((m) => !m.hidden && !m.error && (m.role === 'user' || m.role === 'figure'))
    .map((m) => `${m.role === 'user' ? 'Student' : figureName}: ${m.text.trim()}`)
    .join('\n\n');
}
