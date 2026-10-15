import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ALL_FIGURES, CORE_FIGURES } from '@/data/figures/all';
import { renderFigureIndex } from '@/data/figures/index-render';
import { INVERSE_RELATION, MAX_NETWORK, resolveNetworks } from '@/data/figures/network-resolve';
import { formatIssues, validateFigures } from '@/data/validation';
import type { Figure } from '@/data/types';

describe('denkersdata', () => {
  it('valideert zonder fouten (§6.4)', () => {
    const errors = validateFigures(ALL_FIGURES).filter((i) => i.level === 'error');
    expect(formatIssues(errors)).toBe('');
  });

  it('heeft 8 kerndenkers en 73 denkers in totaal', () => {
    expect(CORE_FIGURES.map((f) => f.id)).toEqual([
      'socrates',
      'aurelius',
      'laozi',
      'kant',
      'franklin',
      'gandhi',
      'spinoza',
      'rousseau',
    ]);
    expect(ALL_FIGURES).toHaveLength(73);
  });

  it('alleen personen die vóór 1950 zijn overleden', () => {
    for (const figure of ALL_FIGURES) expect(figure.died).toBeLessThan(1950);
  });

  it('kerndenkers hebben het ankercitaat uit de briefing', () => {
    const sources = Object.fromEntries(CORE_FIGURES.map((f) => [f.id, f.quotes.map((q) => q.source).join(' | ')]));
    expect(sources.socrates).toContain('Apologie 38a');
    expect(sources.aurelius).toContain('Meditaties 4.3');
    expect(sources.laozi).toContain('Daodejing 64');
    expect(sources.kant).toContain('Was ist Aufklärung');
    expect(sources.franklin).toContain('1737');
    expect(sources.gandhi).toContain('Doctrine of the Sword');
    expect(sources.spinoza).toContain('Tractatus politicus I.4');
    expect(sources.rousseau).toContain('Du contrat social I.1');
  });

  it('de gegenereerde index is actueel (draai anders npm run gen:figures)', () => {
    const file = readFileSync(resolve(process.cwd(), 'src/data/figures/index.generated.ts'), 'utf8');
    expect(file).toBe(renderFigureIndex(ALL_FIGURES));
  });
});

describe('netwerk afleiden', () => {
  const make = (id: string, network: Figure['network']): Figure =>
    ({ ...ALL_FIGURES[0]!, id, network }) as Figure;

  it('voegt omgekeerde relaties toe (leraar ↔ leerling)', () => {
    const nets = resolveNetworks([make('a', [{ id: 'b', relation: 'leerling' }]), make('b', [])]);
    expect(nets.get('b')).toEqual([{ id: 'a', relation: 'leraar', derived: true }]);
  });

  it('expliciete relaties gaan voor en het netwerk blijft max. 10', () => {
    const hub = make(
      'hub',
      Array.from({ length: 10 }, (_, i) => ({ id: `x${i}`, relation: 'vriend' as const })),
    );
    const others = Array.from({ length: 10 }, (_, i) => make(`x${i}`, []));
    const fan = make('fan', [{ id: 'hub', relation: 'leraar' }]);
    const nets = resolveNetworks([hub, ...others, fan]);
    expect(nets.get('hub')).toHaveLength(MAX_NETWORK);
    expect(nets.get('hub')!.some((l) => l.id === 'fan')).toBe(false);
  });

  it('kent voor elke relatie een omgekeerde', () => {
    for (const relation of Object.keys(INVERSE_RELATION)) {
      expect(INVERSE_RELATION[relation as keyof typeof INVERSE_RELATION]).toBeTruthy();
    }
  });

  it('elk afgeleid netwerk in de echte data is ≤ 10 en verwijst naar bestaande denkers', () => {
    const ids = new Set(ALL_FIGURES.map((f) => f.id));
    for (const [id, links] of resolveNetworks(ALL_FIGURES)) {
      expect(links.length, id).toBeLessThanOrEqual(MAX_NETWORK);
      for (const link of links) expect(ids.has(link.id), `${id} → ${link.id}`).toBe(true);
    }
  });
});
