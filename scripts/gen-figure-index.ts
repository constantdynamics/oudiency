/**
 * Genereert src/data/figures/index.generated.ts: de lichte index van alle denkers
 * (naam, thema, netwerk met afgeleide relaties). Draai na het wijzigen van denkersdata:
 *   npm run gen:figures
 */
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { ALL_FIGURES } from '../src/data/figures/all';
import { renderFigureIndex } from '../src/data/figures/index-render';

const target = fileURLToPath(new URL('../src/data/figures/index.generated.ts', import.meta.url));
writeFileSync(target, renderFigureIndex(ALL_FIGURES), 'utf8');
console.log(`Index geschreven: ${ALL_FIGURES.length} denkers → ${target}`);
