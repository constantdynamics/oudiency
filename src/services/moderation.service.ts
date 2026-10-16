/**
 * Moderatie (§7.5, Fase 1): een ingediend college krijgt een automatische pre-check (advies);
 * in de moderatormodus (lokale pincode) keurt een moderator goed of af, met reden. Goedgekeurd
 * verschijnt in de bibliotheek; bij afgekeurd ziet de maker de reden.
 */
import { create } from 'zustand';
import { clock } from '@/lib/clock';
import { sha256Hex } from '@/lib/crypto';
import { useLectureStore } from '@/store/lectureStore';
import { useNotificationStore } from '@/store/miscStores';
import type { Lecture } from '@/store/schemas';
import { useSettingsStore } from '@/store/settingsStore';

/** De tekst die de pre-check beoordeelt: aanvraag, vragen en het hele college (begrensd). */
export function lectureText(lecture: Lecture, max = 12_000): string {
  const parts = [
    `Titel: ${lecture.plan?.title ?? lecture.topic}`,
    `Onderwerp: ${lecture.topic}`,
    `Hoofdvraag: ${lecture.mainQuestion}`,
    ...lecture.questions.map((q) => `Vraag van de student: ${q.text}`),
    ...lecture.segments.map((s) => `${s.heading}\n${s.text}`),
  ];
  const text = parts.join('\n\n');
  return text.length > max ? `${text.slice(0, max)} …` : text;
}

/** De wachtrij: ingediende colleges, oudste eerst. */
export function moderationQueue(lectures: readonly Lecture[]): Lecture[] {
  return lectures
    .filter((l) => l.share === 'ingediend')
    .sort(
      (a, b) => Date.parse(a.submittedAt ?? a.createdAt) - Date.parse(b.submittedAt ?? b.createdAt),
    );
}

function notify(lecture: Lecture, text: string, now: number) {
  useNotificationStore.getState().add({
    id: `melding-moderatie-${lecture.id}-${now}`,
    kind: 'moderatie',
    text,
    link: `/colleges/${lecture.id}`,
    figureId: lecture.figureId,
    visibleAt: new Date(now).toISOString(),
    read: false,
    sourceId: `moderatie:${lecture.id}:${now}`,
  });
}

export function approveLecture(id: string, now = clock.now()): boolean {
  const lecture = useLectureStore.getState().lectures.find((l) => l.id === id);
  if (!lecture || lecture.share !== 'ingediend') return false;
  useLectureStore.getState().update(id, {
    share: 'goedgekeurd',
    publishedAt: new Date(now).toISOString(),
    moderationNote: undefined,
  });
  notify(
    lecture,
    `Je college “${lecture.plan?.title ?? lecture.topic}” staat nu in de bibliotheek.`,
    now,
  );
  return true;
}

export function rejectLecture(id: string, reason: string, now = clock.now()): boolean {
  const lecture = useLectureStore.getState().lectures.find((l) => l.id === id);
  const note = reason.trim();
  if (!lecture || lecture.share !== 'ingediend' || !note) return false;
  useLectureStore.getState().update(id, { share: 'afgekeurd', moderationNote: note.slice(0, 300) });
  notify(
    lecture,
    `Je college “${lecture.plan?.title ?? lecture.topic}” is afgekeurd. Reden: ${note}`,
    now,
  );
  return true;
}

/* ---------- Moderatormodus met pincode ---------- */

export function pinProblem(pin: string): string | undefined {
  return /^\d{4,8}$/.test(pin) ? undefined : 'Kies een pincode van 4 tot 8 cijfers.';
}

/** Alleen de hash wordt bewaard, nooit de pincode zelf. */
export function hashPin(pin: string): Promise<string> {
  return sha256Hex(`oudiency-moderator:${pin}`);
}

/** Ontgrendeld in deze sessie (niet bewaard: na herladen opnieuw de pincode). */
export const useModeratorSession = create<{ unlocked: boolean }>(() => ({ unlocked: false }));

export async function enableModerator(pin: string): Promise<void> {
  const problem = pinProblem(pin);
  if (problem) throw new Error(problem);
  const moderatorPinHash = await hashPin(pin);
  useSettingsStore.getState().update({ moderatorMode: true, moderatorPinHash });
  useModeratorSession.setState({ unlocked: true });
}

export async function unlockModerator(pin: string): Promise<boolean> {
  const { moderatorPinHash } = useSettingsStore.getState().settings;
  const ok = Boolean(moderatorPinHash) && (await hashPin(pin)) === moderatorPinHash;
  if (ok) useModeratorSession.setState({ unlocked: true });
  return ok;
}

export function disableModerator(): void {
  useSettingsStore.getState().update({ moderatorMode: false, moderatorPinHash: undefined });
  useModeratorSession.setState({ unlocked: false });
}
