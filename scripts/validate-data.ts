/**
 * npm run validate:data — controleert alle vaste inhoud (denkers, voorbeeldcolleges, dagvragen,
 * demomodus) en of de gegenereerde denkersindex actueel is. Faalt (exit 1) bij fouten.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ALL_FIGURES } from '../src/data/figures/all';
import { renderFigureIndex } from '../src/data/figures/index-render';
import { formatIssues, validateFigures, type ValidationIssue } from '../src/data/validation';
import { validateAllContent } from '../src/data/validateContent';

const issues: ValidationIssue[] = [...validateFigures(ALL_FIGURES), ...validateAllContent()];

const indexPath = fileURLToPath(new URL('../src/data/figures/index.generated.ts', import.meta.url));
let current = '';
try {
  current = readFileSync(indexPath, 'utf8');
} catch {
  // ontbreekt
}
if (current !== renderFigureIndex(ALL_FIGURES)) {
  issues.push({
    level: 'error',
    scope: 'index',
    message: 'src/data/figures/index.generated.ts is verouderd of ontbreekt — draai: npm run gen:figures',
  });
}

const errors = issues.filter((i) => i.level === 'error');
const warnings = issues.filter((i) => i.level === 'warning');
if (warnings.length) console.log(`Waarschuwingen (${warnings.length}):\n${formatIssues(warnings)}\n`);
if (errors.length) {
  console.error(`Fouten (${errors.length}):\n${formatIssues(errors)}`);
  process.exit(1);
}
console.log(
  `✓ Data geldig: ${ALL_FIGURES.length} denkers (${ALL_FIGURES.filter((f) => f.tier === 'kern').length} kern), ${warnings.length} waarschuwing(en).`,
);
