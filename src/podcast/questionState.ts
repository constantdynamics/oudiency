/**
 * Hoe het met je luistervraag staat (voor de speler): wordt geschreven, staat erin, of mislukt.
 */
import { create } from 'zustand';

export interface QuestionState {
  episodeId?: string;
  status: 'stil' | 'schrijven' | 'klaar' | 'fout';
  /** Bij een fout: uitleg in gewone taal. */
  error?: string;
}

export const useQuestion = create<QuestionState>(() => ({ status: 'stil' }));
