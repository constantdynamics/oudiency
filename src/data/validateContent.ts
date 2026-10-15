/**
 * Validatie van alle vaste inhoud naast de denkers: demomodus, voorbeeldcolleges en dagvragen.
 * Alleen voor scripts en tests (statische imports van alle inhoud).
 */
import { ALL_DEMO_CONTENT } from './demo/all';
import { ALL_FIGURES } from './figures/all';
import { DAILY_QUESTIONS } from './prompts/daily-questions';
import { ALL_EXAMPLE_LECTURES } from './seed/lectures/all';
import {
  validateDailyQuestions,
  validateDemoContent,
  validateExampleLectures,
  type ValidationIssue,
} from './validation';

export function validateAllContent(): ValidationIssue[] {
  return [
    ...validateDemoContent(ALL_DEMO_CONTENT, ALL_FIGURES),
    ...validateExampleLectures(ALL_EXAMPLE_LECTURES, ALL_FIGURES),
    ...validateDailyQuestions(DAILY_QUESTIONS, ALL_FIGURES),
  ];
}
