/** Algemene appconfiguratie. De naam is een werktitel; wijzig hem hier en hij verandert overal. */
export const APP = {
  name: 'Oudiency',
  tagline: 'Een levende filosofische universiteit',
  /** Label op elke AI-uitvoer en op gedeelde citaatkaarten. */
  aiLabel: 'AI-simulatie',
  /** Minimumleeftijd in de voorwaarden (AVG-leeftijd voor eigen toestemming in Nederland). */
  minimumAge: 16,
  /** Namespace voor alle lokale opslag (Fase 1). */
  storageNamespace: 'oudiency:v1',
  /** Versie van het exportformaat van "Mijn data". */
  exportFormatVersion: 1,
  repositoryUrl: 'https://github.com/constantdynamics/oudiency',
  /** Publieke URL op GitHub Pages (ook in de og-tags van index.html). */
  siteUrl: 'https://constantdynamics.github.io/oudiency/',
} as const;

export const CRISIS_RESOURCES = {
  name: '113 Zelfmoordpreventie',
  phone: '113',
  freePhone: '0800-0113',
  chatUrl: 'https://www.113.nl',
  emergency: '112',
} as const;
