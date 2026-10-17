/**
 * Demomodus: kiest passende, vooraf geschreven fragmenten op basis van eenvoudige trefwoorden,
 * de fase van het gesprek en een deterministische seed (zodat herladen hetzelfde oplevert).
 */
import { findMeta, loadFigure } from '@/data/figures';
import { loadDemoContent } from '@/data/demo';
import type {
  DemoFigureContent,
  Figure,
  LectureBlock,
  SessionFragment,
  SessionPhase,
} from '@/data/types';
import { normalize, keywordScore, salientWord, tokenize } from '@/lib/text';
import { pick, seededRng, type Rng } from '@/lib/seeded-rng';
import type { DemoContext, DemoHistoryItem } from '../demoContext';
import { ruleCheck } from '../prompts/moderation';
import { asksIfReal, authenticityReply, crisisReply, detectCrisisSignals } from '../prompts/safety';
import type {
  HelperOutput,
  LecturePlanOutput,
  ModerationOutput,
  SessionSummary,
  TimelineReactionsOutput,
} from '../schemas';
import { anchorOf, fill, tidy } from './fill';
import { genericDemoContent } from './generic';

interface Loaded {
  figure: Figure;
  demo: DemoFigureContent;
  name: string;
}

async function loadAll(figureId: string): Promise<Loaded> {
  const figure = await loadFigure(figureId);
  const demo = (await loadDemoContent(figureId)) ?? genericDemoContent(figure);
  return { figure, demo, name: figure.shortName ?? figure.name };
}

/** Een aanspreekvorm met komma ervoor (", Anna"), of leeg. */
function nameVar(displayName: string): string {
  return displayName.trim() ? `, ${displayName.trim()}` : '';
}

function usedAnchors(history: readonly DemoHistoryItem[]): string[] {
  return history.filter((h) => h.role === 'figure').map((h) => h.text);
}

function isUsed(fragment: SessionFragment, previous: readonly string[]): boolean {
  const anchor = anchorOf(fragment.text);
  return anchor.length >= 12 && previous.some((text) => text.includes(anchor));
}

const FALLBACK_PHASES: Record<SessionPhase, SessionPhase[]> = {
  opening: ['opening'],
  terugkeer: ['terugkeer', 'opening'],
  doorvragen: ['doorvragen', 'verdiepen'],
  verdiepen: ['verdiepen', 'doorvragen'],
  afronden: ['afronden', 'slot', 'verdiepen'],
  slot: ['slot', 'afronden'],
};

export function chooseFragment(
  fragments: readonly SessionFragment[],
  phase: SessionPhase,
  userText: string,
  rng: Rng,
  previous: readonly string[] = [],
  requireTopic = false,
): SessionFragment | undefined {
  for (const candidatePhase of FALLBACK_PHASES[phase]) {
    let pool = fragments.filter((f) => f.phase === candidatePhase && !isUsed(f, previous));
    if (requireTopic) {
      const withTopic = pool.filter((f) => f.text.includes('{onderwerp}'));
      if (withTopic.length) pool = withTopic;
    } else if (candidatePhase === 'opening') {
      const withoutTopic = pool.filter((f) => !f.text.includes('{onderwerp}'));
      if (withoutTopic.length) pool = withoutTopic;
    }
    if (pool.length === 0) continue;
    const scored = pool
      .map((fragment) => ({
        fragment,
        score: (fragment.keywords ? keywordScore(userText, fragment.keywords) * 3 : 0) + rng(),
      }))
      .sort((a, b) => b.score - a.score);
    return scored[0]?.fragment;
  }
  // Alles gebruikt: herhaal dan maar iets uit de fase.
  return (
    pick(
      rng,
      fragments.filter((f) => f.phase === phase),
    ) ?? fragments[0]
  );
}

function sessionPhase(turn: number, remainingMs: number, rng: Rng): SessionPhase {
  if (remainingMs <= 60_000) return 'slot';
  if (remainingMs <= 180_000) return 'afronden';
  if (turn <= 2) return 'doorvragen';
  return rng() < 0.55 ? 'verdiepen' : 'doorvragen';
}

/* ---------- Sessies ---------- */

async function sessionOpening(
  ctx: Extract<DemoContext, { kind: 'session-opening' }>,
): Promise<string> {
  const { demo } = await loadAll(ctx.figureId);
  const rng = seededRng(`${ctx.sessionId}|opening`);
  const returning = ctx.memory.length > 0;
  const fragment = returning
    ? chooseFragment(demo.sessionFragments, 'terugkeer', ctx.topicHint ?? '', rng)
    : chooseFragment(
        demo.sessionFragments,
        'opening',
        ctx.topicHint ?? '',
        rng,
        [],
        Boolean(ctx.topicHint),
      );
  let text = fill(fragment?.text ?? 'Welkom{naam}. Waarover wil je praten?', {
    naam: nameVar(ctx.displayName),
    onderwerp: ctx.topicHint,
    vorige: ctx.memory[0],
  });
  if (returning && ctx.topicHint) {
    text += ` En voor vandaag schreef je: ‘${ctx.topicHint.trim().replace(/[.!?]+$/, '')}’. Vertel.`;
  }
  return text;
}

async function sessionTurn(ctx: Extract<DemoContext, { kind: 'session-turn' }>): Promise<string> {
  const { demo, name } = await loadAll(ctx.figureId);
  if (ctx.crisis || detectCrisisSignals(ctx.userText)) return crisisReply(name);
  if (asksIfReal(ctx.userText)) return authenticityReply(name);
  const rng = seededRng(`${ctx.sessionId}|${ctx.turn}`);
  const phase = sessionPhase(ctx.turn, ctx.remainingMs, rng);
  const fragment = chooseFragment(
    demo.sessionFragments,
    phase,
    ctx.userText,
    rng,
    usedAnchors(ctx.history),
  );
  const woord = salientWord(ctx.userText) ?? 'dat';
  return fill(fragment?.text ?? 'Vertel me meer.', {
    naam: nameVar(ctx.displayName),
    woord,
    onderwerp: ctx.topicHint,
  });
}

async function sessionSummary(
  ctx: Extract<DemoContext, { kind: 'session-summary' }>,
): Promise<SessionSummary> {
  const { demo, name } = await loadAll(ctx.figureId);
  const rng = seededRng(`${ctx.sessionId}|samenvatting`);
  const userText = ctx.history
    .filter((h) => h.role === 'user')
    .map((h) => h.text)
    .join(' ');
  const counts = new Map<string, number>();
  for (const word of tokenize(userText))
    if (word.length > 4) counts.set(word, (counts.get(word) ?? 0) + 1);
  const topics = [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 3)
    .map(([word]) => word);
  if (topics.length === 0 && ctx.topicHint) topics.push(...tokenize(ctx.topicHint).slice(0, 2));
  const turns = ctx.history.filter((h) => h.role === 'user').length;
  const about = topics.length ? topics.map((t) => `‘${t}’`).join(', ') : 'wat je bezighoudt';
  const summary =
    turns === 0
      ? `Je kwam binnen bij ${name}, maar het gesprek kwam niet echt op gang. Soms is alleen het besluit om een vraag te stellen al een begin.`
      : tidy(
          `Je sprak met ${name} over ${about}. ${name} vroeg vooral door op wat je precies bedoelde, in plaats van meteen antwoorden te geven. ` +
            `Daardoor werd zichtbaar wat er voor jou werkelijk op het spel staat. ` +
            (turns >= 4
              ? `Je bent in ${turns} beurten een flink eind gekomen; de vraag is nu wat je ermee doet.`
              : `Het gesprek was kort, maar de vraag die bleef hangen is de moeite waard om mee te nemen.`),
        );
  const reflectionQuestion =
    pick(rng, demo.reflectionQuestions) ?? 'Wat neem je mee uit dit gesprek?';
  return { summary, reflectionQuestion, topics };
}

/* ---------- Colleges ---------- */

function rankBlocks(blocks: readonly LectureBlock[], text: string): LectureBlock[] {
  return [...blocks]
    .map((block, index) => ({
      block,
      score: keywordScore(text, [...block.keywords, block.heading]) * 10 - index * 0.01,
    }))
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.block);
}

async function lecturePlan(
  ctx: Extract<DemoContext, { kind: 'lecture-plan' }>,
): Promise<LecturePlanOutput> {
  const { demo, figure } = await loadAll(ctx.figureId);
  const request = `${ctx.topic} ${ctx.mainQuestion}`;
  const chosen = rankBlocks(demo.lecture.blocks, request).slice(0, 3);
  const title = ctx.topic.trim().replace(/[.!?]+$/, '');
  // Leestips: de werken die het best bij de vraag passen, aangevuld met de hoofdwerken.
  const works = figure.keyWorks
    .map((work, index) => ({
      number: index + 1,
      score: keywordScore(request, tokenize(`${work.title} ${work.note ?? ''}`)),
    }))
    .sort((a, b) => b.score - a.score || a.number - b.number);
  const reading = works.filter((w) => w.score > 0).slice(0, 3);
  for (const work of works) if (reading.length < 2 && !reading.includes(work)) reading.push(work);
  const tags = [...new Set(tokenize(ctx.topic))].slice(0, 3);
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    segments: chosen.map((block) => ({ heading: block.heading, keyPoints: [block.lesson] })),
    furtherReading: reading.map((w) => w.number),
    tags: tags.length ? tags : (chosen[0]?.keywords.slice(0, 2) ?? []),
  };
}

async function lectureSegment(
  ctx: Extract<DemoContext, { kind: 'lecture-segment' }>,
): Promise<string> {
  const { demo, name } = await loadAll(ctx.figureId);
  const rng = seededRng(`${ctx.lectureId}|${ctx.partIndex}|${ctx.segmentKind}`);
  const vars = {
    onderwerp: ctx.topic.replace(/[.!?]+$/, ''),
    hoofdvraag: ctx.mainQuestion.trim(),
    vraag: ctx.question?.trim(),
    woord: ctx.question ? (salientWord(ctx.question) ?? 'dat') : undefined,
  };
  switch (ctx.segmentKind) {
    case 'opening':
      return fill(pick(rng, demo.lecture.openings) ?? '', vars);
    case 'deel': {
      const block =
        demo.lecture.blocks.find((b) => normalize(b.heading) === normalize(ctx.heading)) ??
        rankBlocks(demo.lecture.blocks, `${ctx.topic} ${ctx.mainQuestion}`)[ctx.partIndex - 1] ??
        demo.lecture.blocks[0];
      return block ? fill(block.text, vars) : `${name} zwijgt even en ordent zijn gedachten.`;
    }
    case 'antwoord':
      if (ctx.question && detectCrisisSignals(ctx.question)) return crisisReply(name);
      return fill(pick(rng, demo.lecture.answers) ?? 'Een goede vraag.', vars);
    case 'conclusie': {
      const used = (ctx.blockIds ?? [])
        .map((id) => demo.lecture.blocks.find((b) => b.id === id || b.heading === id))
        .filter((b): b is LectureBlock => Boolean(b));
      const lessons = (
        used.length ? used : rankBlocks(demo.lecture.blocks, ctx.topic).slice(0, 3)
      ).map((b) => b.lesson);
      const intro = fill(pick(rng, demo.lecture.conclusions) ?? '', vars);
      const question = fill(pick(rng, demo.lecture.thinkQuestions) ?? 'Wat neem je mee?', vars);
      return [
        intro,
        '',
        '**Kernlessen**',
        ...lessons.map((lesson, i) => `${i + 1}. ${lesson}`),
        '',
        '**Denkvraag**',
        question,
      ].join('\n');
    }
  }
}

/* ---------- Timeline ---------- */

async function timelineReactions(
  ctx: Extract<DemoContext, { kind: 'timeline-reactions' }>,
): Promise<TimelineReactionsOutput> {
  const rng = seededRng(`${ctx.postId}|reacties`);
  if (detectCrisisSignals(ctx.text)) return { reactions: [] };
  const scored = ctx.candidates
    .map((c) => ({ c, score: keywordScore(ctx.text, c.tags) + rng() * 0.5 }))
    .sort((a, b) => b.score - a.score);
  const relevant = scored.filter((s) => s.score >= 1);

  // Niet elk bericht krijgt reacties.
  const roll = rng();
  let count =
    relevant.length === 0
      ? roll < 0.35
        ? 1
        : 0
      : roll < 0.12
        ? 0
        : roll < 0.6
          ? 1
          : roll < 0.88
            ? 2
            : 3;
  count = Math.min(count, 3);
  const pool = relevant.length ? relevant : scored;
  const chosen = pool
    .filter((s) => !ctx.undiscovered.includes(s.c.id))
    .slice(0, count)
    .map((s) => s.c);

  if (ctx.allowDiscovery) {
    const newcomer = scored.find((s) => ctx.undiscovered.includes(s.c.id) && s.score >= 1)?.c;
    if (newcomer) {
      if (chosen.length >= 3) chosen.pop();
      chosen.push(newcomer);
    }
  }

  const reactions: TimelineReactionsOutput['reactions'] = [];
  for (const candidate of chosen) {
    const isNewcomer = ctx.undiscovered.includes(candidate.id);
    const wantsComment = isNewcomer || rng() < 0.38;
    if (!wantsComment) {
      reactions.push({ figureId: candidate.id, type: 'like', text: '' });
      continue;
    }
    const { demo, figure } = await loadAll(candidate.id);
    const woord = salientWord(ctx.text) ?? 'dit';
    let text: string;
    if (isNewcomer) {
      text = `Ik ben ${figure.name}, ${figure.epithet.charAt(0).toLowerCase()}${figure.epithet.slice(1)}. Je woorden over ‘${woord}’ trokken mijn aandacht. ${demo.timelineReactions[0] ? fill(demo.timelineReactions[0].text, { woord }) : ''}`;
    } else {
      const best = [...demo.timelineReactions]
        .map((r) => ({ r, score: keywordScore(ctx.text, r.keywords) + rng() * 0.4 }))
        .sort((a, b) => b.score - a.score)[0]?.r;
      text = fill(best?.text ?? 'Hier zit iets in. Denk er nog eens over na.', { woord });
    }
    reactions.push({ figureId: candidate.id, type: 'comment', text: tidy(text) });
  }
  return { reactions };
}

/* ---------- Overig ---------- */

function moderation(ctx: Extract<DemoContext, { kind: 'moderation' }>): ModerationOutput {
  return ruleCheck(ctx.text);
}

function helper(ctx: Extract<DemoContext, { kind: 'helper' }>): HelperOutput {
  const rng = seededRng(`helper|${normalize(ctx.query)}`);
  const scored = ctx.candidates
    .map((c) => {
      const meta = findMeta(c.id);
      const helps = meta?.helpsWith ?? [];
      const helpScore = helps.reduce((sum, h) => sum + keywordScore(ctx.query, tokenize(h)), 0);
      return { c, helps, score: keywordScore(ctx.query, c.tags) * 2 + helpScore + rng() * 0.3 };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  return {
    suggestions: scored.map(({ c, helps }) => {
      const match = helps.find((h) => keywordScore(ctx.query, tokenize(h)) > 0) ?? helps[0];
      return {
        figureId: c.id,
        why: match
          ? `${c.name} denkt graag mee over ${match}.`
          : `${c.name} kijkt vanuit ${c.tags.slice(0, 2).join(' en ')} naar je vraag.`,
      };
    }),
  };
}

async function thought(ctx: Extract<DemoContext, { kind: 'thought' }>): Promise<string> {
  const { demo } = await loadAll(ctx.figureId);
  const rng = seededRng(`${ctx.figureId}|${ctx.dateKey}|gedachte`);
  return pick(rng, demo.thoughts) ?? '';
}

/* ---------- Toegang ---------- */

export async function composeText(ctx: DemoContext): Promise<string> {
  switch (ctx.kind) {
    case 'session-opening':
      return sessionOpening(ctx);
    case 'session-turn':
      return sessionTurn(ctx);
    case 'lecture-segment':
      return lectureSegment(ctx);
    case 'thought':
      return thought(ctx);
    case 'daily-question':
      return ctx.question;
    case 'test':
      return 'ok';
    default:
      throw new Error(`Demomodus: geen tekst voor taak "${ctx.kind}"`);
  }
}

export async function composeStructured(ctx: DemoContext): Promise<unknown> {
  switch (ctx.kind) {
    case 'session-summary':
      return sessionSummary(ctx);
    case 'lecture-plan':
      return lecturePlan(ctx);
    case 'timeline-reactions':
      return timelineReactions(ctx);
    case 'moderation':
      return moderation(ctx);
    case 'helper':
      return helper(ctx);
    default:
      throw new Error(`Demomodus: geen gestructureerd antwoord voor taak "${ctx.kind}"`);
  }
}
