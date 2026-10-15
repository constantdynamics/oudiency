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
  const ids = new Set<string>();
  for (const lecture of lectures) {
    const scope = `college ${lecture.id}`;
    if (ids.has(lecture.id)) issues.push({ level: 'error', scope, message: 'dubbele id' });
    ids.add(lecture.id);
    const figure = figures.find((f) => f.id === lecture.figureId);
    if (!figure) {
      issues.push({ level: 'error', scope, message: `onbekende docent ${lecture.figureId}` });
      continue;
    }
    if (lecture.topic.length > 80)
      issues.push({ level: 'error', scope, message: 'onderwerp langer dan 80 tekens' });
    if (lecture.mainQuestion.length > 200) {
      issues.push({ level: 'error', scope, message: 'hoofdvraag langer dan 200 tekens' });
    }
    for (const index of lecture.furtherReading) {
      if (!figure.keyWorks[index]) {
        issues.push({
          level: 'error',
          scope,
          message: `"Verder lezen" verwijst naar onbekend werk #${index}`,
        });
      }
    }
    const kinds = lecture.segments.map((s) => s.kind);
    if (kinds[0] !== 'opening' || kinds[kinds.length - 1] !== 'conclusie') {
      issues.push({
        level: 'error',
        scope,
        message: 'college moet beginnen met een opening en eindigen met een conclusie',
      });
    }
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
    issues.push({ level: 'warning', scope, message: `slechts ${kinds.size} soorten vragen` });
  return issues;
}

export function validateDemoContent(
  content: readonly DemoFigureContent[],
  figures: readonly Figure[],
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  for (const figure of figures.filter((f) => f.tier === 'kern')) {
    const scope = `demo ${figure.id}`;
    const demo = content.find((c) => c.figureId === figure.id);
    if (!demo) {
      issues.push({ level: 'error', scope, message: 'geen demo-inhoud voor kerndenker' });
      continue;
    }
    if (demo.sessionFragments.length < 15) {
      issues.push({
        level: 'error',
        scope,
        message: `${demo.sessionFragments.length} sessiefragmenten (minimaal 15)`,
      });
    }
    for (const phase of ['opening', 'doorvragen', 'verdiepen', 'afronden', 'slot'] as const) {
      if (!demo.sessionFragments.some((f) => f.phase === phase)) {
        issues.push({ level: 'error', scope, message: `geen sessiefragment voor fase "${phase}"` });
      }
    }
    if (demo.timelineReactions.length < 10) {
      issues.push({
        level: 'error',
        scope,
        message: `${demo.timelineReactions.length} timeline-reacties (minimaal 10)`,
      });
    }
    if (demo.lecture.blocks.length < 3)
      issues.push({ level: 'error', scope, message: 'minder dan 3 lesblokken' });
    const fragmentIds = new Set<string>();
    for (const fragment of demo.sessionFragments) {
      if (fragmentIds.has(fragment.id))
        issues.push({ level: 'error', scope, message: `dubbele fragment-id ${fragment.id}` });
      fragmentIds.add(fragment.id);
    }
  }
  return issues;
}

export function formatIssues(issues: readonly ValidationIssue[]): string {
  return issues
    .map((i) => `${i.level === 'error' ? '✗' : '!'} [${i.scope}] ${i.message}`)
    .join('\n');
}
