/**
 * Validatie van alle vaste inhoud naast de denkers: demomodus, voorbeeldcolleges, dagvragen,
 * stemmen, de presentator en de stemtypes.
 * Alleen voor scripts en tests (statische imports van alle inhoud).
 */
import { ALL_DEMO_CONTENT } from './demo/all';
import { ALL_FIGURES } from './figures/all';
import { DAILY_QUESTIONS } from './prompts/daily-questions';
import { HOST } from './podcastHost';
import { ALL_EXAMPLE_LECTURES } from './seed/lectures/all';
import {
  validateDailyQuestions,
  validateDemoContent,
  validateExampleLectures,
  validateHostVoice,
  validateVoiceSpecs,
  validateVoiceTypes,
  type ValidationIssue,
} from './validation';
import { FIGURE_VOICE_GENDER } from './voiceTypes';
import { CORE_VOICES } from './voices';

export function validateAllContent(): ValidationIssue[] {
  return [
    ...validateDemoContent(ALL_DEMO_CONTENT, ALL_FIGURES),
    ...validateExampleLectures(ALL_EXAMPLE_LECTURES, ALL_FIGURES),
    ...validateDailyQuestions(DAILY_QUESTIONS, ALL_FIGURES),
    ...validateVoiceSpecs(CORE_VOICES, ALL_FIGURES),
    ...validateHostVoice(HOST.id, HOST.voice),
    ...validateVoiceTypes(FIGURE_VOICE_GENDER, ALL_FIGURES),
  ];
}
