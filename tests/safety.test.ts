import { describe, expect, it } from 'vitest';
import { asksIfReal, crisisReply, detectCrisisSignals } from '@/ai/prompts/safety';

describe('crisisroute (app-side vangnet)', () => {
  it.each([
    'Ik wil dood.',
    'Soms denk ik aan zelfmoord',
    'ik zie het echt niet meer zitten',
    'Ik wil er een eind aan maken',
    'Ik wil mezelf iets aandoen',
    'Ik wil niet meer leven',
    'I want to die',
    'Ik wil er niet meer zijn.',
    'Soms wou ik dat ik er niet meer was',
    'Iedereen is beter af zonder mij',
    'Ik wil gaan slapen en nooit meer wakker worden',
    'Mijn leven heeft geen zin meer',
    'Ik kan het echt niet meer aan',
    'I don’t want to live anymore',
  ])('herkent "%s"', (text) => {
    expect(detectCrisisSignals(text)).toBe(true);
  });

  it.each([
    'Wat dacht Socrates over de dood?',
    'Is de dood te vrezen, volgens de stoïcijnen?',
    'Mijn opa ging vorig jaar dood en ik mis hem',
    'Ik ben doodmoe van mijn werk',
    'Hoe leef ik een goed leven?',
    'Ik wou dat ik er vorige week bij was',
    'Heeft het leven zin, volgens Camus?',
    'Ik kan niet meer wachten tot de vakantie',
    'Ik wil er een punt achter zetten met mijn oude baan',
    'Ik wil niet meer zo hard werken',
  ])('laat "%s" met rust', (text) => {
    expect(detectCrisisSignals(text)).toBe(false);
  });

  it('de zorgzame melding noemt 113, 0800-0113 en 112', () => {
    const reply = crisisReply('Socrates');
    expect(reply).toContain('113');
    expect(reply).toContain('0800-0113');
    expect(reply).toContain('112');
    expect(reply).toContain('AI-simulatie');
  });

  it('herkent de vraag of je met de echte persoon praat', () => {
    expect(asksIfReal('Ben je echt Socrates?')).toBe(true);
    expect(asksIfReal('Is dit een AI?')).toBe(true);
    expect(asksIfReal('Wat is echt geluk?')).toBe(false);
  });
});
