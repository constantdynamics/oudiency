/**
 * npm run validate:data — controleert alle vaste inhoud (denkers, voorbeeldcolleges, dagvragen,
 * demomodus) en of de gegenereerde indexen actueel zijn. Faalt (exit 1) bij fouten.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ALL_FIGURES } from '../src/data/figures/all';
import { renderFigureIndex } from '../src/data/figures/index-render';
import { ALL_EXAMPLE_LECTURES } from '../src/data/seed/lectures/all';
import { renderLectureIndex } from '../src/data/seed/lectures/meta';
import { formatIssues, validateFigures, type ValidationIssue } from '../src/data/validation';
import { validateAllContent } from '../src/data/validateContent';

const issues: ValidationIssue[] = [...validateFigures(ALL_FIGURES), ...validateAllContent()];

function checkGenerated(relativePath: string, expected: string): void {
  let current = '';
  try {
    current = readFileSync(fileURLToPath(new URL(`../${relativePath}`, import.meta.url)), 'utf8');
  } catch {
    // ontbreekt
  }
  if (current !== expected) {
    issues.push({
      level: 'error',
      scope: 'index',
      message: `${relativePath} is verouderd of ontbreekt — draai: npm run gen:index`,
    });
  }
}

checkGenerated('src/data/figures/index.generated.ts', renderFigureIndex(ALL_FIGURES));
checkGenerated(
  'src/data/seed/lectures/index.generated.ts',
  renderLectureIndex(ALL_EXAMPLE_LECTURES),
);

const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');
if (warnings.length)
  console.log(`Waarschuwingen (${warnings.length}):\n${formatIssues(warnings)}\n`);
if (errors.length) {
  console.error(`Fouten (${errors.length}):\n${formatIssues(errors)}`);
  process.exit(1);
}
console.log(
  `✓ Data geldig: ${ALL_FIGURES.length} denkers (${ALL_FIGURES.filter((f) => f.tier === 'kern').length} kern), ${ALL_EXAMPLE_LECTURES.length} voorbeeldcolleges, ${warnings.length} waarschuwing(en).`,
);
