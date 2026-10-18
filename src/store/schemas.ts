/**
 * Zod-schema's voor alles wat lokaal wordt opgeslagen. De typen worden hieruit afgeleid, zodat
 * validatie (bij laden en importeren) en TypeScript altijd overeenkomen.
 *
 * We gebruiken `zod/mini` (functionele API, tree-shakable): deze schema's zitten in de
 * startbundel, en mini is daar ~17 kB gzip kleiner dan de klassieke API.
 */
import * as z from 'zod/mini';

const isoDate = z.string().check(z.minLength(10));
const count = () => z.int().check(z.minimum(0));

/* ---------- Profiel ---------- */

export const UsageDaySchema = z.object({
  sessions: count(),
  lectures: count(),
  /** Onderzoeken op aanvraag (later toegevoegd, dus optioneel). */
  research: z.optional(count()),
});

export const UserProfileSchema = z.object({
  displayName: z.string().check(z.maxLength(40)),
  tier: z.enum(['basis', 'premium']),
  credits: count(),
  follows: z.array(z.string()),
  discovered: z.array(z.string()),
  usageByDate: z.record(z.string(), UsageDaySchema),
  createdAt: isoDate,
  onboarded: z.boolean(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

/* ---------- Afspraken & sessies ---------- */

export const BookingStatusSchema = z.enum([
  'gepland',
  'actief',
  'afgerond',
  'gemist',
  'geannuleerd',
]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingSchema = z.object({
  id: z.string(),
  figureId: z.string(),
  /** Lokale datum 'YYYY-MM-DD'. */
  date: z.string().check(z.regex(/^\d{4}-\d{2}-\d{2}$/)),
  /** 'HH:MM' */
  time: z.string().check(z.regex(/^\d{2}:\d{2}$/)),
  topicHint: z.optional(z.string()),
  status: BookingStatusSchema,
  createdAt: isoDate,
  sessionId: z.optional(z.string()),
  /** Herinneringsmelding voor de starttijd is aangemaakt. */
  notified: z.optional(z.boolean()),
});
export type Booking = z.infer<typeof BookingSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  /** 'system' = door de app gegenereerd (bijv. de binnenkomst of het afscheid); niet altijd zichtbaar. */
  role: z.enum(['user', 'figure', 'system']),
  text: z.string(),
  createdAt: isoDate,
  outOfCharacter: z.optional(z.boolean()),
  /** Tijdcontext die met dit bericht naar het model ging, bijv. "[beurt 3 · verstreken 4:10 · resterend 10:50]". */
  timeContext: z.optional(z.string()),
  /** Verborgen app-bericht dat wel naar het model gaat (bijv. "De student komt binnen"). */
  hidden: z.optional(z.boolean()),
  error: z.optional(z.boolean()),
  refusal: z.optional(z.boolean()),
});
export type Message = z.infer<typeof MessageSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  figureId: z.string(),
  startedAt: isoDate,
  /** Opgeslagen eindtijd; de timer rekent hier altijd vanaf (klopt na herladen of tabwissel). */
  endsAt: isoDate,
  extensions: count(),
  compensatedMs: count(),
  messages: z.array(MessageSchema),
  summary: z.optional(z.string()),
  reflectionQuestion: z.optional(z.string()),
  topics: z.optional(z.array(z.string())),
  status: z.enum(['actief', 'afronden', 'afgerond']),
  endedAt: z.optional(isoDate),
  endReason: z.optional(z.enum(['tijd', 'gebruiker', 'crisis', 'verbinding', 'fout'])),
  /** Getypt of gebeld (ontbreekt bij oudere sessies: dan getypt). */
  mode: z.optional(z.enum(['tekst', 'bellen'])),
  /** Er klonk een crisissignaal: de hulpkaart blijft zichtbaar bij dit gesprek. */
  crisis: z.optional(z.boolean()),
  topicHint: z.optional(z.string()),
  provider: z.enum(['demo', 'anthropic-browser', 'proxy']),
  /** Er is gewaarschuwd dat de tijd bijna om is. */
  warned: z.optional(z.boolean()),
});
export type Session = z.infer<typeof SessionSchema>;

/* ---------- Colleges ---------- */

export const LecturePlanSchema = z.object({
  title: z.string(),
  segments: z.array(
    z.object({
      heading: z.string(),
      keyPoints: z.array(z.string()),
    }),
  ),
});
export type LecturePlan = z.infer<typeof LecturePlanSchema>;

export const LectureSegmentSchema = z.object({
  index: count(),
  kind: z.enum(['opening', 'deel', 'antwoord', 'conclusie']),
  heading: z.string(),
  text: z.string(),
});
export type LectureSegment = z.infer<typeof LectureSegmentSchema>;

export const ShareStatusSchema = z.enum(['privé', 'ingediend', 'goedgekeurd', 'afgekeurd']);
export type ShareStatus = z.infer<typeof ShareStatusSchema>;

export const PrecheckSchema = z.object({
  verdict: z.enum(['ok', 'twijfel', 'afwijzen']),
  reasons: z.array(z.string()),
  checkedAt: isoDate,
  source: z.enum(['ai', 'regels']),
});
export type Precheck = z.infer<typeof PrecheckSchema>;

export const LectureSchema = z.object({
  id: z.string(),
  figureId: z.string(),
  topic: z.string(),
  mainQuestion: z.string(),
  plan: z.optional(LecturePlanSchema),
  segments: z.array(LectureSegmentSchema),
  questions: z.array(z.object({ afterSegment: z.int(), text: z.string() })),
  status: z.enum(['bezig', 'afgerond']),
  share: ShareStatusSchema,
  moderationNote: z.optional(z.string()),
  precheck: z.optional(PrecheckSchema),
  submittedAt: z.optional(isoDate),
  publishedAt: z.optional(isoDate),
  isExample: z.optional(z.boolean()),
  likedByMe: z.boolean(),
  createdAt: isoDate,
  completedAt: z.optional(isoDate),
  /** Indexen in figure.keyWorks voor "Verder lezen" (nooit verzonnen titels). */
  furtherReading: z.optional(z.array(count())),
  tags: z.optional(z.array(z.string())),
  provider: z.enum(['demo', 'anthropic-browser', 'proxy']),
});
export type Lecture = z.infer<typeof LectureSchema>;

/* ---------- Timeline ---------- */

export const ReactionSchema = z.object({
  id: z.string(),
  figureId: z.string(),
  type: z.enum(['like', 'comment']),
  text: z.optional(z.string()),
  visibleAt: isoDate,
  seen: z.boolean(),
  /** Deze reactie liet een nog niet ontdekte denker kennismaken. */
  discovery: z.optional(z.boolean()),
});
export type Reaction = z.infer<typeof ReactionSchema>;

export const PostSchema = z.object({
  id: z.string(),
  text: z.string(),
  tags: z.array(z.string()),
  createdAt: isoDate,
  editedAt: z.optional(isoDate),
  promptId: z.optional(z.string()),
  /** De vraag zoals die gesteld werd (in de stijl van de denker). */
  promptText: z.optional(z.string()),
  promptFigureId: z.optional(z.string()),
  isFollowUp: z.optional(z.boolean()),
  likedByMe: z.optional(z.boolean()),
  reactions: z.array(ReactionSchema),
  /** Bij crisissignalen: geen rollenspelreacties maar een hulpkaart. */
  crisis: z.optional(z.boolean()),
});
export type Post = z.infer<typeof PostSchema>;

export const DailyQuestionDaySchema = z.object({
  /** Getoonde vraag-id's op deze dag (de eerste is de geplande, daarna eventueel "andere vraag"). */
  shown: z.array(z.string()),
  rerolls: count(),
  askerId: z.string(),
  /** Vraagtekst in de stijl van de denker (AI), per vraag-id. */
  styled: z.optional(z.record(z.string(), z.string())),
  answeredPostId: z.optional(z.string()),
  followUp: z.optional(
    z.object({
      questionId: z.string(),
      visibleAt: isoDate,
      answeredPostId: z.optional(z.string()),
    }),
  ),
});
export type DailyQuestionDay = z.infer<typeof DailyQuestionDaySchema>;

/* ---------- Meldingen ---------- */

export const NotificationSchema = z.object({
  id: z.string(),
  kind: z.enum(['reactie', 'ontdekt', 'afspraak', 'moderatie', 'vervolgvraag', 'systeem']),
  text: z.string(),
  link: z.optional(z.string()),
  figureId: z.optional(z.string()),
  /** Pas zichtbaar vanaf dit moment (bijv. vertraagde reacties, starttijd afspraak). */
  visibleAt: isoDate,
  read: z.boolean(),
  /** Er is een browsernotificatie voor getoond. */
  pushed: z.optional(z.boolean()),
  /** Bron-id om dubbele meldingen te voorkomen. */
  sourceId: z.optional(z.string()),
});
export type AppNotification = z.infer<typeof NotificationSchema>;

/* ---------- Bibliotheek (likes, terugkijken) ---------- */

export const LibraryStateSchema = z.object({
  /** lectureId → tijdstip van je like (ISO). */
  likes: z.record(z.string(), isoDate),
  /** lectureId → bekeken/afgerond (voor statistieken en aanbevelingen). */
  watched: z.record(z.string(), z.object({ startedAt: isoDate, completedAt: z.optional(isoDate) })),
});
export type LibraryState = z.infer<typeof LibraryStateSchema>;

/* ---------- Instellingen ---------- */

export const TaskModelSchema = z.object({
  model: z.string(),
  effort: z.enum(['low', 'medium', 'high']),
  maxTokens: z.int().check(z.minimum(256), z.maximum(64_000)),
});

export const SettingsSchema = z.object({
  aiSource: z.enum(['demo', 'anthropic-browser']),
  taskModels: z.record(z.string(), TaskModelSchema),
  serverFallback: z.boolean(),
  browserNotifications: z.boolean(),
  moderatorMode: z.boolean(),
  moderatorPinHash: z.optional(z.string()),
  readingVoice: z.boolean(),
  demoBannerDismissed: z.boolean(),
  /** Dev: reacties en vervolgvragen direct zichtbaar. */
  devInstantReactions: z.boolean(),
  devPanelEnabled: z.boolean(),
});
export type Settings = z.infer<typeof SettingsSchema>;

/* ---------- Verbruik ---------- */

export const UsageEntrySchema = z.object({
  at: isoDate,
  task: z.string(),
  model: z.string(),
  inputTokens: count(),
  outputTokens: count(),
  cacheReadTokens: count(),
  cacheWriteTokens: count(),
});
export type UsageEntry = z.infer<typeof UsageEntrySchema>;

/* ---------- Cache (gedachte van vandaag e.d.) ---------- */

export const ContentCacheSchema = z.object({
  /** `${figureId}|${datum}` → gedachte van vandaag. */
  thoughts: z.record(z.string(), z.object({ text: z.string(), provider: z.string() })),
  /** De denker van de dag ligt vast voor die dag (ook als je hem die dag ontdekt). */
  figureOfTheDay: z.optional(z.object({ dateKey: z.string(), figureId: z.string() })),
});
export type ContentCache = z.infer<typeof ContentCacheSchema>;

/* ---------- Bellen (spraak) ---------- */

export const CallTranscriptEntrySchema = z.object({
  role: z.enum(['user', 'figure', 'system']),
  text: z.string(),
  at: isoDate,
});
export type CallTranscriptEntry = z.infer<typeof CallTranscriptEntrySchema>;

export const CallEndReasonSchema = z.enum([
  'tijd',
  'gebruiker',
  'crisis',
  'verbinding',
  'stilte',
  'fout',
]);
export type CallEndReason = z.infer<typeof CallEndReasonSchema>;

export const CallCostSchema = z.object({
  credits: z.optional(z.number()),
  fiat: z.optional(z.number()),
  /** 'gesprek' = opgegeven door ElevenLabs; 'tegoed' = verschil in verbruikt tegoed. */
  source: z.enum(['gesprek', 'tegoed']),
});
export type CallCost = z.infer<typeof CallCostSchema>;

/** Een proefgesprek (de spraakproef); echte belsessies komen in de sessies terecht. */
export const TrialCallSchema = z.object({
  id: z.string(),
  figureId: z.string(),
  startedAt: isoDate,
  endedAt: isoDate,
  endReason: CallEndReasonSchema,
  conversationId: z.optional(z.string()),
  transcript: z.array(CallTranscriptEntrySchema),
  cost: z.optional(CallCostSchema),
});
export type TrialCall = z.infer<typeof TrialCallSchema>;

export const VoiceStateSchema = z.object({
  /** De agent in het ElevenLabs-account van de gebruiker (geen geheim: werkt alleen met de sleutel). */
  agent: z.optional(
    z.object({
      id: z.string(),
      configVersion: z.int(),
      /** Aangemaakt met de minimale configuratie (terugval). */
      minimal: z.optional(z.boolean()),
      updatedAt: isoDate,
    }),
  ),
  /** Gekozen stem per denker (id in het ElevenLabs-account). */
  voices: z.record(z.string(), z.object({ voiceId: z.string(), createdAt: isoDate })),
  /**
   * Met "andere stem" gekozen stem per spreker (denker of Sophie): gaat overal voor, ook boven
   * een ontworpen stem. Weg = weer automatisch.
   */
  overrides: z.optional(
    z.record(
      z.string(),
      z.object({ voiceId: z.string(), name: z.optional(z.string()), updatedAt: isoDate }),
    ),
  ),
  trials: z.array(TrialCallSchema),
  /** Laatst opgevraagde accountgegevens (abonnement en tegoed). */
  account: z.optional(
    z.object({
      tier: z.string(),
      creditsUsed: z.number(),
      creditLimit: z.number(),
      resetsAt: z.optional(z.number()),
      currency: z.optional(z.string()),
      checkedAt: isoDate,
    }),
  ),
});
export type VoiceState = z.infer<typeof VoiceStateSchema>;

/* ---------- Podcasts ---------- */

export const PodcastFormatSchema = z.enum(['monoloog', 'gesprek', 'interview']);
export type PodcastFormat = z.infer<typeof PodcastFormatSchema>;

export const PodcastSegmentSchema = z.object({
  id: z.string(),
  /** Wie spreekt: de presentator ('sophie') of een denker (id). */
  speaker: z.string(),
  text: z.string(),
  kind: z.enum(['intro', 'deel', 'luistervraag', 'antwoord', 'terug', 'outro']),
});
export type PodcastSegment = z.infer<typeof PodcastSegmentSchema>;

export const PodcastEpisodeSchema = z.object({
  id: z.string(),
  createdAt: isoDate,
  title: z.string(),
  topic: z.string(),
  format: PodcastFormatSchema,
  /** Eén of twee denkers. */
  figureIds: z.array(z.string()),
  /** Gevraagde lengte in minuten. */
  minutes: count(),
  source: z.enum(['aanvraag', 'dagelijks']),
  status: z.enum(['schrijven', 'klaar', 'fout']),
  error: z.optional(z.string()),
  segments: z.array(PodcastSegmentSchema),
  /** Dag (JJJJ-MM-DD) van een dagaflevering. */
  day: z.optional(z.string()),
  /** Gemaakt uit een onderzoek op aanvraag: de notitie gaat mee als achtergrond. */
  researchId: z.optional(z.string()),
  /** Waar je gebleven was: fragment en seconden daarin. */
  position: z.optional(z.object({ segment: count(), seconds: z.number() })),
  finishedAt: z.optional(isoDate),
});
export type PodcastEpisode = z.infer<typeof PodcastEpisodeSchema>;

export const PodcastSettingsSchema = z.object({
  dailyEnabled: z.boolean(),
  dailyMinutes: count(),
  speed: z.number(),
  autoplay: z.boolean(),
  /** Gekozen stemmodel na het vergelijken; zonder keuze het goedkoopste. */
  ttsModel: z.optional(z.string()),
});
export type PodcastSettings = z.infer<typeof PodcastSettingsSchema>;

export const PodcastStateSchema = z.object({
  episodes: z.array(PodcastEpisodeSchema),
  /** De wachtrij: afleveringen in afspeelvolgorde (de eerste speelt nu of als volgende). */
  queue: z.array(z.string()),
  settings: PodcastSettingsSchema,
});
export type PodcastState = z.infer<typeof PodcastStateSchema>;
