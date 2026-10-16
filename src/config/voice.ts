/**
 * Bellen met de denkers (spraak): ElevenLabs Agents doet luisteren, beurtwisseling en de stem;
 * Claude is het brein (via ElevenLabs). Eén agent in het ElevenLabs-account van de gebruiker
 * speelt alle denkers: per gesprek geeft de app de rol (kader + persona), de stem en de
 * openingszin mee. Alles hier is standaardwaarde; de logica staat in src/voice.
 */
export const VOICE = {
  apiBase: 'https://api.elevenlabs.io',
  agentName: 'Oudiency · denkers (AI-simulatie)',
  agentTag: 'oudiency',
  /** Verhoog bij elke wijziging in de agentconfiguratie: de app werkt de agent dan zelf bij. */
  agentConfigVersion: 1,
  /** Het brein achter de stem (ElevenLabs biedt de Claude-modellen zelf aan). */
  llm: 'claude-sonnet-5-5',
  /** Valt Sonnet even weg, dan blijft het Claude. */
  backupLlm: 'claude-haiku-5-5',
  /** Eleven v4 Turbo: snel (±100 ms), expressief, 90+ talen; gemaakt voor spraakagents. */
  ttsModel: 'eleven_v4_turbo',
  /** Terugval als het account het voorkeursmodel (nog) niet accepteert. */
  ttsFallbackModel: 'eleven_flash_v2_5',
  language: 'nl',
  outputAudioFormat: 'pcm_24000',
  /** Stemontwerp (Voice Design): v3 kan accenten en karakter goed neerzetten. */
  voiceDesignModel: 'eleven_ttv_v3',
  /** Terugval als het account v3-stemontwerp (nog) niet accepteert. */
  voiceDesignFallbackModel: 'eleven_multilingual_ttv_v2',
  previewFormat: 'mp3_22050_32',
  /**
   * Vangnet aan de kant van ElevenLabs; de app hangt zelf eerder op.
   * 15 minuten + 2× 5 minuten verlengen + 2 minuten compensatie + marge.
   */
  maxDurationSeconds: 30 * 60,
  /** Kostenvangnet: na zoveel seconden stilte hangt ElevenLabs op (bijvoorbeeld als je wegloopt). */
  silenceEndCallSeconds: 120,
  /** Zo lang mag je stil zijn (nadenken) voordat de denker iets zegt. */
  turnTimeoutSeconds: 12,
  callLimits: { concurrent: 1, perDay: 20 },
  /** Het afscheid mag hooguit zo lang duren; daarna hangt de app op. */
  farewellMaxMs: 30_000,
  /** Na het afscheid nog even wachten, zodat de laatste woorden niet worden afgekapt. */
  farewellGraceMs: 800,
  /** Zoveel proefgesprekken bewaren we lokaal. */
  trialHistory: 5,
  /** Duur van een proefgesprek: gelijk aan een echte sessie. */
  trialMinutes: 15,
  /** Na het gesprek zo vaak de kosten opvragen (ElevenLabs verwerkt ze even). */
  costPollDelaysMs: [2_000, 4_000, 6_000, 8_000],
} as const;

/**
 * Vaste zinnen voor de agent. De rol per denker komt per gesprek mee; dit is alleen de basis
 * voor als er iets misgaat (bijvoorbeeld de harde maximale duur).
 */
export const VOICE_AGENT_TEXT = {
  basePrompt:
    'Je bent een AI-simulatie van een grote denker in Oudiency, een Nederlandstalige app. De app geeft per gesprek de volledige rol mee. Spreek altijd Nederlands.',
  maxDurationMessage:
    'Onze tijd is helaas om, en ik moet nu door naar een andere student. Dank je wel voor het gesprek.',
  /** Korte opvulling als het antwoord even op zich laat wachten. */
  fillers: ['Hm…', 'Even denken…', 'Tja…'],
} as const;
