/**
 * Het lopende onderdeel van een college (niet bewaard): plan maken, tekst die binnenstroomt en
 * fouten. Pas een compleet onderdeel gaat het college in; een afgebroken onderdeel vervalt en
 * wordt bij "Ga verder" opnieuw gemaakt.
 */
import { create } from 'zustand';
import { type AiErrorInfo, describeAiError, isAbort } from '@/ai';
import { toast } from '@/components/toastStore';
import type { Figure } from '@/data/types';
import { t } from '@/i18n/nl';
import { markdownToPlainText } from '@/lib/markdown';
import { speak } from '@/lib/speech';
import { findLecture, nextStep } from '@/services/lecture.service';
import { useLibraryStore } from '@/store/miscStores';
import { useSettingsStore } from '@/store/settingsStore';

export type LectureRunStatus = 'stil' | 'plant' | 'denkt' | 'schrijft' | 'fout';

interface LectureRunState {
  lectureId?: string;
  status: LectureRunStatus;
  text: string;
  error?: AiErrorInfo;
  controller?: AbortController;
}

export const useLectureRun = create<LectureRunState>(() => ({ status: 'stil', text: '' }));

export function isRunning(state: LectureRunState, lectureId: string): boolean {
  return state.lectureId === lectureId && state.status !== 'stil' && state.status !== 'fout';
}

/**
 * Maak de volgende stap. Zonder plan eerst het plan en direct daarna de opening; verder
 * precies één onderdeel, waarna het college wacht op "Ga verder" of een vraag.
 */
export async function runNext(lectureId: string, figure: Figure, studentName?: string) {
  if (isRunning(useLectureRun.getState(), lectureId)) return;
  const controller = new AbortController();
  // Begin je intussen aan een ander college, dan loopt dit onderdeel stil door en wordt het
  // gewoon bewaard; alleen de weergave hoort dan bij het nieuwe college.
  const mine = () => useLectureRun.getState().controller === controller;
  const patch = (state: Partial<LectureRunState>) => {
    if (mine()) useLectureRun.setState(state);
  };
  useLectureRun.setState({ lectureId, status: 'denkt', text: '', error: undefined, controller });
  try {
    const ai = await import('@/services/lectureAi');
    const lecture = findLecture(lectureId);
    if (lecture && nextStep(lecture).kind === 'plan') {
      patch({ status: 'plant' });
      await ai.generatePlan(lectureId, figure, studentName);
      if (controller.signal.aborted) throw new DOMException('Afgebroken', 'AbortError');
      patch({ status: 'denkt' });
    }
    const segment = await ai.generateNextSegment(
      lectureId,
      figure,
      (chunk) => {
        if (mine()) useLectureRun.setState((s) => ({ status: 'schrijft', text: s.text + chunk }));
      },
      controller.signal,
      studentName,
    );
    if (segment && mine() && useSettingsStore.getState().settings.readingVoice) {
      speak(markdownToPlainText(segment.text));
    }
    if (findLecture(lectureId)?.status === 'afgerond') {
      useLibraryStore.getState().markWatched(lectureId, true);
      if (mine()) toast(t.lectures.finished, 'ok');
    }
    patch({ status: 'stil', text: '', controller: undefined });
  } catch (error) {
    if (isAbort(error)) {
      patch({ status: 'stil', text: '', controller: undefined });
      return;
    }
    console.warn('[college] onderdeel mislukt', error);
    patch({
      status: 'fout',
      text: '',
      controller: undefined,
      error: describeAiError(error),
    });
  }
}

export function stopRun(): void {
  useLectureRun.getState().controller?.abort();
}

export function clearRunError(): void {
  useLectureRun.setState({ status: 'stil', error: undefined, text: '' });
}
