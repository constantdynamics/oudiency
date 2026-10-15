/**
 * Datavalidatie (§6.4). Draait in CI via `npm run validate:data` en als unittest.
 *
 * Faalt bij: netwerk-id zonder profiel · netwerk groter dan 10 · sterfjaar 1950 of later ·
 * citaat zonder bron of status · dubbele id's · ontbrekende verplichte velden · te weinig
 * contrast in een thema · ongeldige spreekuurtijden.
 * Waarschuwt bij: citaten met verified: false, en profielen die buiten de afgesproken omvang vallen.
 */
import { contrastRatio, parseHex } from '@/lib/contrast';
import { MAX_NETWORK, resolveNetworks } from './figures/network-resolve';
import type { DailyQuestion, DemoFigureContent, ExampleLecture, Figure } from './types';

export interface ValidationIssue {
  level: 'error' | 'warning';
  scope: string;
  message: string;
}

const MIN_CONTRAST = 4.5;
const SLOT_RE = /^\d{2}:\d{2}$/;

function sentenceCount(text: string): number {
  return text
    .split(/(?<=[.!?])\s+(?=[A-ZÀ-Ý"“‘'(])/u)
    .map((s) => s.trim())
    .filter(Boolean).length;
}

/* ---------- Citaten en plaatshouders in vaste teksten ---------- */

const QUOTE_WITH_SOURCE_RE = /“([^”]+)”\s*\(([^)]*)\)/g;
const PLACEHOLDER_RE = /\{([a-z]+)\}/g;
const KNOWN_PLACEHOLDERS = new Set(['naam', 'onderwerp', 'woord', 'vorige', 'hoofdvraag', 'vraag']);

function normalizeQuote(text: string): string {
  return text
    .replace(/[‘’'"“”„]/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/**
 * Letterlijke citaten in vaste teksten: alles wat als “…” (bron) wordt gepresenteerd, moet
 * woordelijk voorkomen in de geverifieerde citaten van die denker (§8.5). Geeft de afwijkende
 * citaten terug (ingekort).
 */
export function findUnverifiedQuotes(text: string, figure: Figure): string[] {
  const verified = new Set(
    figure.quotes.filter((q) => q.verified).map((q) => normalizeQuote(q.text)),
  );
  const problems: string[] = [];
  for (const match of text.matchAll(QUOTE_WITH_SOURCE_RE)) {
    const quoted = match[1] ?? '';
    if (quoted.includes('{')) continue;
    if (!verified.has(normalizeQuote(quoted))) problems.push(quoted.slice(0, 60));
  }
  return problems;
}

/** Plaatshouders in een tekst ({naam}, {woord}, …). */
export function placeholdersIn(text: string): string[] {
  return [...text.matchAll(PLACEHOLDER_RE)].map((m) => m[1] ?? '');
}

export function validateFigures(figures: readonly Figure[]): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const error = (scope: string, message: string) => issues.push({ level: 'error', scope, message });
  const warn = (scope: string, message: string) =>
    issues.push({ level: 'warning', scope, message });

  const ids = new Set<string>();
  for (const figure of figures) {
    if (ids.has(figure.id)) error(figure.id, 'dubbele id');
    ids.add(figure.id);
  }

  for (const f of figures) {
    const scope = f.id;
    // Verplichte velden
    const required: [string, unknown][] = [
      ['id', f.id],
      ['name', f.name],
      ['epithet', f.epithet],
      ['origin', f.origin],
      ['school', f.school],
      ['bio', f.bio],
      ['modernLens', f.modernLens],
      ['voice.register', f.voice?.register],
      ['voice.method', f.voice?.method],
    ];
    for (const [field, value] of required) {
      if (typeof value !== 'string' || value.trim() === '')
        error(scope, `verplicht veld ontbreekt: ${field}`);
    }
    if (!/^[a-z]+$/.test(f.id)) error(scope, 'id moet uit kleine letters bestaan (a–z)');
    if (f.tags.length === 0) error(scope, 'geen thema-tags');
    if (f.keyConcepts.length === 0) error(scope, 'geen kernbegrippen');
    if (f.keyWorks.length === 0) error(scope, 'geen werken (nodig voor "Verder lezen")');
    if (f.lifeEvents.length === 0) error(scope, 'geen levensgebeurtenissen');
    if (f.helpsWith.length === 0) error(scope, 'geen "helpsWith"');
    if (f.microcopy.farewells.length === 0) error(scope, 'geen afscheidszinnen');

    // Rooster: alleen personen die vóór 1950 zijn overleden.
    if (!Number.isFinite(f.died) || f.died >= 1950)
      error(scope, `sterfjaar ${f.died}: alleen vóór 1950 toegestaan`);
    if (f.born >= f.died) error(scope, 'geboortejaar ligt niet vóór sterfjaar');

    // Citaten
    for (const [i, q] of f.quotes.entries()) {
      const qs = `${scope} citaat ${i + 1}`;
      if (!q.text?.trim()) error(qs, 'lege citaattekst');
      if (!q.source?.trim()) error(qs, 'citaat zonder bron');
      if (!q.status) error(qs, 'citaat zonder status');
      if ((q.status === 'parafrase' || q.status === 'toegeschreven') && !q.note?.trim()) {
        error(qs, `status "${q.status}" vereist een toelichting (note)`);
      }
      if (!q.verified) warn(qs, 'citaat is (nog) niet geverifieerd');
    }
    if (f.tier === 'kern') {
      const verifiedAuthentic = f.quotes.filter(
        (q) => q.verified && q.status === 'authentiek',
      ).length;
      if (verifiedAuthentic < 3)
        error(
          scope,
          `kerndenker heeft ${verifiedAuthentic} geverifieerde authentieke citaten (minimaal 3)`,
        );
      if (f.helpsWith.length < 3) warn(scope, 'kerndenker heeft weinig "helpsWith"');
    } else {
      const sentences = sentenceCount(f.bio);
      if (sentences < 2 || sentences > 5)
        warn(scope, `bio heeft ${sentences} zinnen (richtlijn 2–4)`);
      if (f.lifeEvents.length < 3 || f.lifeEvents.length > 7) {
        warn(scope, `${f.lifeEvents.length} levensgebeurtenissen (richtlijn 3–5)`);
      }
      if (f.quotes.length > 3) warn(scope, `${f.quotes.length} citaten (richtlijn max. 3)`);
    }

    // Netwerk
    if (f.network.length > MAX_NETWORK)
      error(scope, `netwerk heeft ${f.network.length} relaties (max. ${MAX_NETWORK})`);
    const seen = new Set<string>();
    for (const link of f.network) {
      if (link.id === f.id) error(scope, 'netwerk verwijst naar zichzelf');
      if (!figures.some((other) => other.id === link.id))
        error(scope, `netwerk-id zonder profiel: ${link.id}`);
      if (seen.has(link.id)) error(scope, `dubbele relatie met ${link.id}`);
      seen.add(link.id);
    }

    // Thema: AA-contrast
    const { primary, surface, secondary, accent } = f.theme;
    for (const [name, value] of [
      ['primary', primary],
      ['secondary', secondary],
      ['accent', accent],
      ['surface', surface],
    ] as const) {
      if (!parseHex(value)) error(scope, `thema.${name} is geen geldige #rrggbb-kleur`);
    }
    if (parseHex(primary) && parseHex(surface)) {
      const onSurface = contrastRatio(primary, surface);
      if (onSurface < MIN_CONTRAST)
        error(scope, `contrast primary/surface ${onSurface.toFixed(2)} < ${MIN_CONTRAST}`);
      const onPrimary = contrastRatio('#ffffff', primary);
      if (onPrimary < MIN_CONTRAST)
        error(scope, `contrast wit/primary ${onPrimary.toFixed(2)} < ${MIN_CONTRAST}`);
      const onCard = contrastRatio(primary, '#fffcf5');
      if (onCard < MIN_CONTRAST)
        error(scope, `contrast primary/kaart ${onCard.toFixed(2)} < ${MIN_CONTRAST}`);
    }

    // Spreekuur
    if (f.availability.slots.length < 6)
      warn(scope, `slechts ${f.availability.slots.length} spreekuurtijden`);
    for (const slot of f.availability.slots) {
      if (!SLOT_RE.test(slot) || slot < '09:00' || slot > '21:00')
        error(scope, `ongeldige spreekuurtijd ${slot}`);
    }
  }

  // Afgeleid netwerk blijft binnen de grens
  for (const [id, links] of resolveNetworks(figures)) {
    if (links.length > MAX_NETWORK) error(id, `afgeleid netwerk te groot (${links.length})`);
    if (links.length === 0) warn(id, 'denker heeft geen enkele relatie');
  }
  return issues;
}

export function validateExampleLectures(
  lectures: readonly ExampleLecture[],
  figures: readonly Figure[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const error = (scope: string, message: string) => issues.push({ level: 'error', scope, message });
  const ids = new Set<string>();
  const perFigure = new Map<string, number>();
  for (const lecture of lectures) {
    const scope = `college ${lecture.id}`;
    if (ids.has(lecture.id)) error(scope, 'dubbele id');
    ids.add(lecture.id);
    if (!/^vb-[a-z0-9-]+$/.test(lecture.id)) error(scope, "id moet beginnen met 'vb-'");
    const figure = figures.find((f) => f.id === lecture.figureId);
    if (!figure) {
      error(scope, `onbekende docent ${lecture.figureId}`);
      continue;
    }
    perFigure.set(figure.id, (perFigure.get(figure.id) ?? 0) + 1);
    if (!lecture.topic.trim() || lecture.topic.length > 80)
      error(scope, 'onderwerp ontbreekt of is langer dan 80 tekens');
    if (!lecture.mainQuestion.trim() || lecture.mainQuestion.length > 200)
      error(scope, 'hoofdvraag ontbreekt of is langer dan 200 tekens');
    if (!lecture.mainQuestion.trim().endsWith('?')) error(scope, 'hoofdvraag eindigt niet op ?');
    if (!lecture.title.trim()) error(scope, 'geen titel');
    if (lecture.tags.length === 0) error(scope, 'geen tags');
    if (Number.isNaN(Date.parse(lecture.publishedAt))) error(scope, 'ongeldige publicatiedatum');
    if (lecture.furtherReading.length === 0) error(scope, 'geen "Verder lezen"');
    for (const index of lecture.furtherReading) {
      if (!figure.keyWorks[index])
        error(scope, `"Verder lezen" verwijst naar onbekend werk #${index}`);
    }
    const kinds = lecture.segments.map((s) => s.kind);
    if (kinds[0] !== 'opening' || kinds[kinds.length - 1] !== 'conclusie') {
      error(scope, 'college moet beginnen met een opening en eindigen met een conclusie');
    }
    if (kinds.filter((k) => k === 'deel').length !== 3)
      error(scope, 'college heeft niet precies 3 delen');
    const conclusion = lecture.segments[lecture.segments.length - 1]?.text ?? '';
    if (!conclusion.includes('**Kernlessen**') || !conclusion.includes('**Denkvraag**'))
      error(scope, 'conclusie mist **Kernlessen** of **Denkvraag**');
    for (const segment of lecture.segments) {
      if (!segment.heading.trim() || !segment.text.trim())
        error(scope, `leeg segment (${segment.kind})`);
      if (placeholdersIn(segment.text).length)
        error(scope, `plaatshouder in vaste tekst (${segment.heading})`);
      for (const quote of findUnverifiedQuotes(segment.text, figure))
        error(scope, `citaat niet in de geverifieerde lijst: “${quote}…”`);
    }
  }
  for (const figure of figures.filter((f) => f.tier === 'kern')) {
    if (!perFigure.get(figure.id))
      error(`colleges ${figure.id}`, 'kerndenker heeft geen voorbeeldcollege');
  }
  return issues;
}

export function validateDailyQuestions(
  questions: readonly DailyQuestion[],
  figures: readonly Figure[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const scope = 'dagvragen';
  if (questions.length < 60)
    issues.push({
      level: 'error',
      scope,
      message: `slechts ${questions.length} dagvragen (minimaal 60)`,
    });
  const ids = new Set<string>();
  const kinds = new Set<string>();
  for (const q of questions) {
    if (ids.has(q.id)) issues.push({ level: 'error', scope, message: `dubbele id ${q.id}` });
    ids.add(q.id);
    kinds.add(q.kind);
    for (const asker of q.askers) {
      if (!figures.some((f) => f.id === asker))
        issues.push({
          level: 'error',
          scope,
          message: `${q.id}: onbekende vragensteller ${asker}`,
        });
    }
    if (!q.followUp.trim())
      issues.push({ level: 'error', scope, message: `${q.id}: geen vervolgvraag` });
  }
  if (kinds.size < 7)
    issues.push({
      level: 'error',
      scope,
      message: `slechts ${kinds.size} soorten vragen (7 nodig)`,
    });
  for (const q of questions) {
    if (q.askers.length === 0)
      issues.push({ level: 'error', scope, message: `${q.id}: geen vragensteller` });
    if (!q.text.trim().endsWith('?'))
      issues.push({ level: 'error', scope, message: `${q.id}: vraag eindigt niet op ?` });
    if (!q.followUp.trim().endsWith('?'))
      issues.push({ level: 'error', scope, message: `${q.id}: vervolgvraag eindigt niet op ?` });
    if (q.text.length > 220)
      issues.push({ level: 'warning', scope, message: `${q.id}: vraag is erg lang` });
  }
  return issues;
}

export function validateDemoContent(
  content: readonly DemoFigureContent[],
  figures: readonly Figure[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const figure of figures.filter((f) => f.tier === 'kern')) {
    const scope = `demo ${figure.id}`;
    const error = (message: string) => issues.push({ level: 'error', scope, message });
    const demo = content.find((c) => c.figureId === figure.id);
    if (!demo) {
      error('geen demo-inhoud voor kerndenker');
      continue;
    }
    const fragments = demo.sessionFragments;
    if (fragments.length < 15) error(`${fragments.length} sessiefragmenten (minimaal 15)`);
    for (const phase of [
      'opening',
      'terugkeer',
      'doorvragen',
      'verdiepen',
      'afronden',
      'slot',
    ] as const) {
      if (!fragments.some((f) => f.phase === phase))
        error(`geen sessiefragment voor fase "${phase}"`);
    }
    const openings = fragments.filter((f) => f.phase === 'opening');
    if (!openings.some((f) => f.text.includes('{onderwerp}')))
      error('geen opening die het opgegeven onderwerp gebruikt');
    if (!openings.some((f) => !f.text.includes('{onderwerp}')))
      error('geen opening zonder onderwerp');
    const fragmentIds = new Set<string>();
    for (const fragment of fragments) {
      if (fragmentIds.has(fragment.id)) error(`dubbele fragment-id ${fragment.id}`);
      fragmentIds.add(fragment.id);
      for (const name of placeholdersIn(fragment.text)) {
        if (!KNOWN_PLACEHOLDERS.has(name))
          error(`${fragment.id}: onbekende plaatshouder {${name}}`);
        if (name === 'vorige' && fragment.phase !== 'terugkeer')
          error(`${fragment.id}: {vorige} hoort alleen in een terugkeer-fragment`);
        if (name === 'onderwerp' && fragment.phase !== 'opening')
          error(`${fragment.id}: {onderwerp} hoort alleen in een opening`);
        if (name === 'hoofdvraag' || name === 'vraag')
          error(`${fragment.id}: {${name}} hoort alleen in colleges`);
      }
    }
    if (!fragments.some((f) => f.phase === 'terugkeer' && f.text.includes('{vorige}')))
      error('geen terugkeer-fragment dat de vorige sessie noemt');

    const { lecture } = demo;
    if (lecture.blocks.length < 3) error('minder dan 3 lesblokken');
    if (!lecture.openings.length || !lecture.answers.length || !lecture.conclusions.length)
      error('college mist openingen, antwoorden of conclusies');
    if (!lecture.thinkQuestions.length) error('geen denkvragen');
    const blockIds = new Set<string>();
    for (const block of lecture.blocks) {
      if (blockIds.has(block.id)) error(`dubbele lesblok-id ${block.id}`);
      blockIds.add(block.id);
      if (!block.lesson.trim() || !block.heading.trim() || block.keywords.length === 0)
        error(`${block.id}: kop, kernles of trefwoorden ontbreken`);
    }
    const lectureTexts: [string, string[]][] = [
      ['opening', lecture.openings],
      ['lesblok', lecture.blocks.map((b) => b.text)],
      ['antwoord', lecture.answers],
      ['conclusie', lecture.conclusions],
      ['denkvraag', lecture.thinkQuestions],
    ];
    const allowed: Record<string, string[]> = {
      opening: ['onderwerp', 'hoofdvraag'],
      lesblok: ['onderwerp', 'hoofdvraag'],
      antwoord: ['vraag', 'woord', 'onderwerp'],
      conclusie: ['hoofdvraag', 'onderwerp'],
      denkvraag: ['onderwerp'],
    };
    for (const [kind, texts] of lectureTexts) {
      for (const text of texts) {
        for (const name of placeholdersIn(text)) {
          if (!allowed[kind]?.includes(name))
            error(`${kind}: plaatshouder {${name}} niet toegestaan`);
        }
      }
    }

    if (demo.timelineReactions.length < 10)
      error(`${demo.timelineReactions.length} timeline-reacties (minimaal 10)`);
    if (!demo.timelineReactions.some((r) => r.keywords.length === 0))
      error('geen algemene timeline-reactie (zonder trefwoorden) als vangnet');
    if (demo.reflectionQuestions.length < 3) error('minder dan 3 reflectievragen');
    if (demo.thoughts.length < 5) error('minder dan 5 gedachten van de dag');

    const everything = [
      ...fragments.map((f) => f.text),
      ...lectureTexts.flatMap(([, texts]) => texts),
      ...demo.timelineReactions.map((r) => r.text),
      ...demo.reflectionQuestions,
      ...demo.thoughts,
    ];
    for (const text of everything) {
      for (const quote of findUnverifiedQuotes(text, figure))
        error(`citaat niet in de geverifieerde lijst: “${quote}…”`);
    }
  }
  return issues;
}

export function formatIssues(issues: readonly ValidationIssue[]): string {
  return issues
    .map((i) => `${i.level === 'error' ? '✗' : '!'} [${i.scope}] ${i.message}`)
    .join('\n');
}
