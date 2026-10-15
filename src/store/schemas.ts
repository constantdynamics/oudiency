/**
 * Zod-schema's voor alles wat lokaal wordt opgeslagen. De typen worden hieruit afgeleid, zodat
 * validatie (bij laden en importeren) en TypeScript altijd overeenkomen.
 */
import { z } from 'zod';

const isoDate = z.string().min(10);

/* ---------- Profiel ---------- */

export const UsageDaySchema = z.object({
  sessions: z.number().int().min(0),
  lectures: z.number().int().min(0),
});

export const UserProfileSchema = z.object({
  displayName: z.string().max(40),
  tier: z.enum(['basis', 'premium']),
  credits: z.number().int().min(0),
  follows: z.array(z.string()),
  discovered: z.array(z.string()),
  usageByDate: z.record(z.string(), UsageDaySchema),
  createdAt: isoDate,
  onboarded: z.boolean(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

/* ---------- Afspraken & sessies ---------- */

export const BookingStatusSchema = z.enum(['gepland', 'actief', 'afgerond', 'gemist', 'geannuleerd']);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

export const BookingSchema = z.object({
  id: z.string(),
  figureId: z.string(),
  /** Lokale datum 'YYYY-MM-DD'. */
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** 'HH:MM' */
  time: z.string().regex(/^\d{2}:\d{2}$/),
  topicHint: z.string().optional(),
  status: BookingStatusSchema,
  createdAt: isoDate,
  sessionId: z.string().optional(),
  /** Herinneringsmelding voor de starttijd is aangemaakt. */
  notified: z.boolean().optional(),
});
export type Booking = z.infer<typeof BookingSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  /** 'system' = door de app gegenereerd (bijv. de binnenkomst of het afscheid); niet altijd zichtbaar. */
  role: z.enum(['user', 'figure', 'system']),
  text: z.string(),
  createdAt: isoDate,
  outOfCharacter: z.boolean().optional(),
  /** Tijdcontext die met dit bericht naar het model ging, bijv. "[beurt 3 · verstreken 4:10 · resterend 10:50]". */
  timeContext: z.string().optional(),
  /** Verborgen app-bericht dat wel naar het model gaat (bijv. "De student komt binnen"). */
  hidden: z.boolean().optional(),
  error: z.boolean().optional(),
  refusal: z.boolean().optional(),
});
export type Message = z.infer<typeof MessageSchema>;

export const SessionSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  figureId: z.string(),
  startedAt: isoDate,
  /** Opgeslagen eindtijd; de timer rekent hier altijd vanaf (klopt na herladen of tabwissel). */
  endsAt: isoDate,
  extensions: z.number().int().min(0),
  compensatedMs: z.number().int().min(0),
  messages: z.array(MessageSchema),
  summary: z.string().optional(),
  reflectionQuestion: z.string().optional(),
  topics: z.array(z.string()).optional(),
  status: z.enum(['actief', 'afronden', 'afgerond']),
  endedAt: isoDate.optional(),
  endReason: z.enum(['tijd', 'gebruiker']).optional(),
  topicHint: z.string().optional(),
  provider: z.enum(['demo', 'anthropic-browser', 'proxy']),
  /** Er is gewaarschuwd dat de tijd bijna om is. */
  warned: z.boolean().optional(),
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
  index: z.number().int().min(0),
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
  plan: LecturePlanSchema.optional(),
  segments: z.array(LectureSegmentSchema),
  questions: z.array(z.object({ afterSegment: z.number().int(), text: z.string() })),
  status: z.enum(['bezig', 'afgerond']),
  share: ShareStatusSchema,
  moderationNote: z.string().optional(),
  precheck: PrecheckSchema.optional(),
  submittedAt: isoDate.optional(),
  publishedAt: isoDate.optional(),
  isExample: z.boolean().optional(),
  likedByMe: z.boolean(),
  createdAt: isoDate,
  completedAt: isoDate.optional(),
  /** Indexen in figure.keyWorks voor "Verder lezen" (nooit verzonnen titels). */
  furtherReading: z.array(z.number().int().min(0)).optional(),
  tags: z.array(z.string()).optional(),
  provider: z.enum(['demo', 'anthropic-browser', 'proxy']),
});
export type Lecture = z.infer<typeof LectureSchema>;

/* ---------- Timeline ---------- */

export const ReactionSchema = z.object({
  id: z.string(),
  figureId: z.string(),
  type: z.enum(['like', 'comment']),
  text: z.string().optional(),
  visibleAt: isoDate,
  seen: z.boolean(),
  /** Deze reactie liet een nog niet ontdekte denker kennismaken. */
  discovery: z.boolean().optional(),
});
export type Reaction = z.infer<typeof ReactionSchema>;

export const PostSchema = z.object({
  id: z.string(),
  text: z.string(),
  tags: z.array(z.string()),
  createdAt: isoDate,
  editedAt: isoDate.optional(),
  promptId: z.string().optional(),
  /** De vraag zoals die gesteld werd (in de stijl van de denker). */
  promptText: z.string().optional(),
  promptFigureId: z.string().optional(),
  isFollowUp: z.boolean().optional(),
  likedByMe: z.boolean().optional(),
  reactions: z.array(ReactionSchema),
  /** Bij crisissignalen: geen rollenspelreacties maar een hulpkaart. */
  crisis: z.boolean().optional(),
});
export type Post = z.infer<typeof PostSchema>;

export const DailyQuestionDaySchema = z.object({
  /** Getoonde vraag-id's op deze dag (de eerste is de geplande, daarna eventueel "andere vraag"). */
  shown: z.array(z.string()),
  rerolls: z.number().int().min(0),
  askerId: z.string(),
  /** Vraagtekst in de stijl van de denker (AI), per vraag-id. */
  styled: z.record(z.string(), z.string()).optional(),
  answeredPostId: z.string().optional(),
  followUp: z
    .object({
      questionId: z.string(),
      visibleAt: isoDate,
      answeredPostId: z.string().optional(),
    })
    .optional(),
});
export type DailyQuestionDay = z.infer<typeof DailyQuestionDaySchema>;

/* ---------- Meldingen ---------- */

export const NotificationSchema = z.object({
  id: z.string(),
  kind: z.enum(['reactie', 'ontdekt', 'afspraak', 'moderatie', 'vervolgvraag', 'systeem']),
  text: z.string(),
  link: z.string().optional(),
  figureId: z.string().optional(),
  /** Pas zichtbaar vanaf dit moment (bijv. vertraagde reacties, starttijd afspraak). */
  visibleAt: isoDate,
  read: z.boolean(),
  /** Er is een browsernotificatie voor getoond. */
  pushed: z.boolean().optional(),
  /** Bron-id om dubbele meldingen te voorkomen. */
  sourceId: z.string().optional(),
});
export type AppNotification = z.infer<typeof NotificationSchema>;

/* ---------- Bibliotheek (likes, terugkijken) ---------- */

export const LibraryStateSchema = z.object({
  /** lectureId → tijdstip van je like (ISO). */
  likes: z.record(z.string(), isoDate),
  /** lectureId → bekeken/afgerond (voor statistieken en aanbevelingen). */
  watched: z.record(z.string(), z.object({ startedAt: isoDate, completedAt: isoDate.optional() })),
});
export type LibraryState = z.infer<typeof LibraryStateSchema>;

/* ---------- Instellingen ---------- */

export const TaskModelSchema = z.object({
  model: z.string(),
  effort: z.enum(['low', 'medium', 'high']),
  maxTokens: z.number().int().min(256).max(64_000),
});

export const SettingsSchema = z.object({
  aiSource: z.enum(['demo', 'anthropic-browser']),
  taskModels: z.record(z.string(), TaskModelSchema),
  serverFallback: z.boolean(),
  browserNotifications: z.boolean(),
  moderatorMode: z.boolean(),
  moderatorPinHash: z.string().optional(),
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
  inputTokens: z.number().int().min(0),
  outputTokens: z.number().int().min(0),
  cacheReadTokens: z.number().int().min(0),
  cacheWriteTokens: z.number().int().min(0),
});
export type UsageEntry = z.infer<typeof UsageEntrySchema>;

/* ---------- Cache (gedachte van vandaag e.d.) ---------- */

export const ContentCacheSchema = z.object({
  /** `${figureId}|${datum}` → gedachte van vandaag. */
  thoughts: z.record(z.string(), z.object({ text: z.string(), provider: z.string() })),
});
export type ContentCache = z.infer<typeof ContentCacheSchema>;
