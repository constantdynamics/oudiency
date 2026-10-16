import { describe, expect, it } from 'vitest';
import { buildPersona } from '@/ai/prompts/persona';
import { FRAME } from '@/ai/prompts/frame';
import { thoughtRequest } from '@/ai/prompts/thought';
import { CORE_IDS, FIGURES_META } from '@/data/figures';
import { ALL_FIGURES } from '@/data/figures/all';
import { lifespanOf, nativeLang } from '@/data/figures/format';
import { relationPhrase } from '@/data/figures/relations';
import { discoveredSet, frontier, isDiscovered, teaserHint } from '@/features/figures/discovery';
import { cleanThought, thoughtKey } from '@/services/thought.service';

const socrates = ALL_FIGURES.find((f) => f.id === 'socrates')!;

describe('relaties als lopende zin', () => {
  it('beschrijft wie X is ten opzichte van de denker', () => {
    expect(relationPhrase('leerling', 'Socrates')).toBe('leerling van Socrates');
    expect(relationPhrase('invloed', 'Kant')).toBe('inspireerde Kant');
    expect(relationPhrase('voorbeeld', 'Franklin')).toBe('voorbeeld voor Franklin');
  });
});

describe('ontdekken', () => {
  it('kerndenkers zijn altijd ontdekt, netwerkdenkers pas na ontdekken', () => {
    expect(isDiscovered('socrates', [])).toBe(true);
    expect(isDiscovered('plato', [])).toBe(false);
    expect(isDiscovered('plato', ['plato'])).toBe(true);
    expect(discoveredSet(['plato', 'bestaat-niet']).size).toBe(CORE_IDS.length + 1);
  });

  it('geeft een hint vanuit een ontdekte denker en bepaalt de rand van het netwerk', () => {
    const known = discoveredSet([]);
    expect(teaserHint('plato', known)).toBe('leerling van Socrates');
    const edge = frontier(known).map((m) => m.id);
    expect(edge).toContain('plato');
    expect(edge.some((id) => CORE_IDS.includes(id))).toBe(false);
    // Elke netwerkdenker op de rand heeft een hint.
    for (const id of edge) expect(teaserHint(id, known)).toBeTruthy();
    expect(FIGURES_META.length).toBe(73);
  });
});

describe('weergave', () => {
  it('levensjaren en taalcode van de eigen naam', () => {
    expect(lifespanOf(socrates)).toBe('ca. 470–399 v.Chr.');
    expect(nativeLang('greek')).toBe('grc');
    expect(nativeLang('latin')).toBeUndefined();
  });
});

describe('promptlaag', () => {
  it('het kader bevat taal-, citaten- en veiligheidsregels', () => {
    expect(FRAME).toContain('Spreek altijd Nederlands');
    expect(FRAME).toContain('geverifieerde citaten');
    expect(FRAME).toContain('113');
    expect(FRAME).toContain('AI-simulatie');
  });

  it('de persona noemt alleen geverifieerde citaten en de eigen werken', () => {
    const persona = buildPersona(socrates);
    expect(persona).toContain('Een leven zonder onderzoek is voor een mens het leven niet waard.');
    expect(persona).toContain('Plato, Apologie');
    expect(persona).toContain('SCHADUWKANTEN');
    for (const quote of socrates.quotes.filter((q) => !q.verified))
      expect(persona).not.toContain(quote.text);
  });

  it('elke denker krijgt een bruikbare persona', () => {
    for (const figure of ALL_FIGURES) {
      const persona = buildPersona(figure);
      expect(persona).toContain(figure.name);
      expect(persona).toContain('WERKEN');
      expect(persona).not.toContain('undefined');
    }
  });

  it('de gedachte van vandaag cachet kader en persona en vraagt om een korte tekst', () => {
    const req = thoughtRequest(socrates, '2026-10-15', new Date(2026, 9, 15, 9).getTime());
    expect(req.task).toBe('thoughtOfTheDay');
    expect(req.system.filter((b) => b.cache)).toHaveLength(2);
    expect(req.system[2]?.text).toContain('20 tot 45 woorden');
    expect(req.demo).toEqual({ kind: 'thought', figureId: 'socrates', dateKey: '2026-10-15' });
  });
});

describe('gedachte van vandaag', () => {
  it('sleutel per denker per dag en opgeschoonde tekst', () => {
    expect(thoughtKey('kant', '2026-10-15')).toBe('kant|2026-10-15');
    expect(cleanThought('  “Durf  te denken.”  ')).toBe('Durf te denken.');
  });
});
