/**
 * Alle getallen uit de functionele specificatie (§7) staan hier als standaardwaarde.
 * De logica die ze toepast zit in één service: src/services/limits.service.ts — zodat
 * Fase 2 dezelfde regels serverside kan afdwingen.
 */
export const LIMITS = {
  session: {
    durationMinutes: 15,
    /** Zachte waarschuwing: de denker begint af te ronden. */
    warnAtRemainingMinutes: 3,
    finalThoughtAtRemainingMinutes: 1,
    perDay: { basis: 1, premium: 3 },
    extension: { minutes: 5, creditCost: 1, maxPerSession: 2 },
    /** "De deur staat open": starten kan tot zoveel minuten na de starttijd. */
    startWindowMinutes: 10,
    /** Maximale compensatie voor tijd die verloren gaat door API-fouten. */
    maxCompensationMinutes: 2,
    /** Aantal vorige samenvattingen dat als geheugen meegaat. */
    memorySessions: 3,
    /** Spreekuur: dagen vooruit (vandaag + 7). */
    bookingDaysAhead: 7,
    slotMinutes: 15,
    slotsPerDay: { min: 6, max: 8 },
    /** Aandeel slots dat "bezet" is door een andere student. */
    busyShare: 0.35,
    topicHintMaxLength: 140,
  },
  lecture: {
    perDay: { basis: 1, premium: 3 },
    maxQuestions: 3,
    topicMaxLength: 80,
    mainQuestionMaxLength: 200,
    questionMaxLength: 300,
    /** Doellengte in minuten leestijd (totaal). */
    targetReadingMinutes: { min: 12, max: 15 },
    /** Leestempo voor de afspeelmodus (woorden per minuut). */
    playbackWordsPerMinute: 220,
  },
  /** Onderwerpen laten uitzoeken; een extra vorm uit hetzelfde onderzoek telt niet mee. */
  research: {
    perDay: { basis: 1, premium: 3 },
  },
  timeline: {
    postMaxLength: 500,
    maxReactions: 3,
    commentMaxWords: 60,
    /** Verschijntijd van reacties na plaatsen (minuten). */
    reactionDelayMinutes: { min: 1, max: 20 },
    /** Kans dat een reactieronde een nog niet ontdekte denker bevat. */
    discoveryChance: 1 / 3,
    /** Geen herhaling van de dagvraag binnen zoveel dagen. */
    dailyQuestionNoRepeatDays: 30,
    dailyQuestionRerollsPerDay: 1,
    /** Vervolgvraag verschijnt zoveel uur na beantwoorden (dev: direct). */
    followUpDelayHours: { min: 2, max: 4 },
  },
  credits: {
    start: 2,
  },
  share: {
    highlightMaxLength: 200,
  },
  thoughtOfTheDay: {
    perFigurePerDay: 1,
  },
} as const;

export type Tier = 'basis' | 'premium';
