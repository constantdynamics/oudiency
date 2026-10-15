/**
 * Genereert de lichte indexen die de app synchroon laadt:
 *  - src/data/figures/index.generated.ts   (denkers: naam, thema, netwerk met afgeleide relaties)
 *  - src/data/seed/lectures/index.generated.ts  (voorbeeldcolleges: titel, tags, leestijd)
 * Draai na het wijzigen van denkersdata of voorbeeldcolleges:
 *   npm run gen:index
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ALL_FIGURES } from '../src/data/figures/all';
import { renderFigureIndex } from '../src/data/figures/index-render';
import { ALL_EXAMPLE_LECTURES } from '../src/data/seed/lectures/all';
import { renderLectureIndex } from '../src/data/seed/lectures/meta';

const figuresTarget = fileURLToPath(
  new URL('../src/data/figures/index.generated.ts', import.meta.url),
);
writeFileSync(figuresTarget, renderFigureIndex(ALL_FIGURES), 'utf8');
console.log(`Denkersindex geschreven: ${ALL_FIGURES.length} denkers.`);

const lecturesTarget = fileURLToPath(
  new URL('../src/data/seed/lectures/index.generated.ts', import.meta.url),
);
writeFileSync(lecturesTarget, renderLectureIndex(ALL_EXAMPLE_LECTURES), 'utf8');
console.log(`Collegeindex geschreven: ${ALL_EXAMPLE_LECTURES.length} voorbeeldcolleges.`);
