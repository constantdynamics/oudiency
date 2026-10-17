/**
 * Eén belgesprek, los van React en van de ElevenLabs-SDK (die zit achter `StartCall`), zodat de
 * logica te testen is: verbinden, het transcript, tijdsignalen bij 3 en 1 minuut, het afscheid,
 * de crisisrem en ophangen. De timer rekent altijd vanaf `endsAt` (nooit aftellende state).
 */
import { detectCrisisSignals } from '@/ai/prompts/safety';
import { TIME_CUES } from '@/ai/prompts/voice';
import { LIMITS } from '@/config/limits';
import { VOICE } from '@/config/voice';
import { clock } from '@/lib/clock';
import { timerState } from '@/services/session-timer';
import type { CallEndReason } from '@/store/schemas';
import { VoiceApiError, type VoiceErrorKind } from './api';

export type CallStatus = 'klaar' | 'verbinden' | 'live' | 'afscheid' | 'beeindigd' | 'fout';
export type CallMode = 'luistert' | 'denkt' | 'spreekt';
export type CallErrorKind = VoiceErrorKind | 'microfoon' | 'verbinding';

export interface TranscriptLine {
  id: string;
  role: 'user' | 'figure' | 'system';
  text: string;
  at: number;
}

export interface CallState {
  status: CallStatus;
  mode: CallMode;
  muted: boolean;
  startedAt?: number;
  endsAt?: number;
  endedAt?: number;
  transcript: readonly TranscriptLine[];
  endReason?: CallEndReason;
  error?: { kind: CallErrorKind; message?: string };
  conversationId?: string;
  /** Er klonk een crisissignaal: het gesprek is gestopt en de hulpkaart hoort zichtbaar te zijn. */
  crisis: boolean;
}

/** Wat de app tijdens het gesprek met de verbinding kan doen. */
export interface CallConnection {
  end(): Promise<void>;
  setMuted(muted: boolean): void;
  /** Context voor de denker zonder dat die meteen reageert (tijdsignalen). */
  sendContext(text: string): void;
  /** Een bericht dat wél een reactie uitlokt (het afscheid aan het eind). */
  sendText(text: string): void;
}

/** Wat de verbinding aan de sessie meldt. */
export interface CallEvents {
  connected(conversationId: string): void;
  message(role: 'user' | 'agent', text: string): void;
  /** Na een onderbreking: het deel van het antwoord dat echt is uitgesproken. */
  corrected(original: string, corrected: string): void;
  mode(mode: 'speaking' | 'listening'): void;
  disconnected(reason: 'user' | 'agent' | 'error', message?: string): void;
}

export type StartCall = (events: CallEvents) => Promise<CallConnection>;

export interface CallSessionOptions {
  start: StartCall;
  durationMs: number;
  /** Vaste eindtijd (een geboekte sessie); anders `durationMs` vanaf het verbinden. */
  endsAt?: number;
  now?: () => number;
  /** Herhaalt `fn` elke `ms` milliseconden; geeft een stopfunctie terug. */
  every?: (fn: () => void, ms: number) => () => void;
  /** Na afloop van een gesprek dat echt verbonden was. */
  onEnded?: (state: CallState) => void;
}

const CUE_TEXTS = new Set<string>(Object.values(TIME_CUES));

/** Vertaalt een fout bij het starten naar iets wat de gebruiker kan oplossen. */
export function classifyStartError(error: unknown): { kind: CallErrorKind; message?: string } {
  if (error instanceof VoiceApiError) return { kind: error.kind, message: error.message };
  if (error instanceof DOMException) {
    if (
      ['NotAllowedError', 'SecurityError', 'NotFoundError', 'NotReadableError'].includes(error.name)
    )
      return { kind: 'microfoon', message: error.message };
  }
  const message = error instanceof Error ? error.message : undefined;
  if (message && /permission|microphone|getusermedia|notallowed/i.test(message))
    return { kind: 'microfoon', message };
  return { kind: 'verbinding', message };
}

function defaultEvery(fn: () => void, ms: number): () => void {
  const id = setInterval(fn, ms);
  return () => clearInterval(id);
}

export class CallSession {
  private state: CallState = {
    status: 'klaar',
    mode: 'luistert',
    muted: false,
    transcript: [],
    crisis: false,
  };
  private readonly listeners = new Set<() => void>();
  private connection?: CallConnection;
  private stopTimer?: () => void;
  private cues = { afronden: false, slot: false };
  private farewell?: { since: number; spoken: boolean; doneAt?: number };
  private ending = false;
  private lineCounter = 0;

  private readonly options: CallSessionOptions;

  constructor(options: CallSessionOptions) {
    this.options = options;
  }

  getSnapshot = (): CallState => this.state;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private now(): number {
    return (this.options.now ?? clock.now)();
  }

  private set(patch: Partial<CallState>): void {
    this.state = { ...this.state, ...patch };
    for (const listener of this.listeners) listener();
  }

  private append(role: TranscriptLine['role'], text: string): void {
    this.lineCounter += 1;
    const line = { id: `r${this.lineCounter}`, role, text, at: this.now() };
    this.set({ transcript: [...this.state.transcript, line] });
  }

  async start(): Promise<void> {
    if (this.state.status !== 'klaar') return;
    this.set({ status: 'verbinden', error: undefined });
    try {
      const connection = await this.options.start(this.events);
      this.connection = connection;
      // Tijdens het verbinden al opgehangen (of het gesprek liep al af).
      if (this.ending) await connection.end().catch(() => undefined);
    } catch (error) {
      this.connection = undefined;
      if (this.ending) return;
      this.set({ status: 'fout', error: classifyStartError(error) });
    }
  }

  private readonly events: CallEvents = {
    connected: (conversationId) => {
      if (this.state.status !== 'verbinden' || this.ending) return;
      const startedAt = this.now();
      this.set({
        status: 'live',
        conversationId,
        startedAt,
        endsAt: this.options.endsAt ?? startedAt + this.options.durationMs,
      });
      this.stopTimer = (this.options.every ?? defaultEvery)(() => this.tick(), 500);
    },
    message: (role, text) => {
      const clean = text.trim();
      if (!clean || this.isOver()) return;
      if (role === 'agent') {
        this.append('figure', clean);
        return;
      }
      if (CUE_TEXTS.has(clean)) return;
      this.append('user', clean);
      if (this.state.mode !== 'spreekt') this.set({ mode: 'denkt' });
      if (detectCrisisSignals(clean)) {
        this.set({ crisis: true });
        void this.hangUp('crisis');
      }
    },
    corrected: (original, corrected) => {
      const target = original.trim();
      const lines = [...this.state.transcript];
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i];
        if (line?.role === 'figure' && line.text === target) {
          lines[i] = { ...line, text: corrected.trim() || line.text };
          this.set({ transcript: lines });
          return;
        }
      }
    },
    mode: (mode) => {
      if (this.isOver()) return;
      if (mode === 'speaking') {
        if (this.farewell) this.farewell.spoken = true;
        this.set({ mode: 'spreekt' });
        return;
      }
      if (this.state.mode === 'spreekt') this.set({ mode: 'luistert' });
      if (this.farewell?.spoken && this.farewell.doneAt === undefined) {
        this.farewell.doneAt = this.now();
      }
    },
    disconnected: (reason, message) => {
      if (this.ending || this.isOver()) return;
      if (this.state.status === 'verbinden') {
        this.set({ status: 'fout', error: { kind: 'verbinding', message } });
        return;
      }
      if (reason === 'error') this.finish('verbinding', { kind: 'verbinding', message });
      else if (reason === 'agent')
        this.finish(this.state.status === 'afscheid' ? 'tijd' : 'verbinding');
      else this.finish('gebruiker');
    },
  };

  private isOver(): boolean {
    return this.state.status === 'beeindigd' || this.state.status === 'fout';
  }

  /** Klokslag (elke halve seconde): tijdsignalen, het afscheid en ophangen. */
  tick(): void {
    const { status, startedAt, endsAt } = this.state;
    const connection = this.connection;
    if (!connection || startedAt === undefined || endsAt === undefined || this.ending) return;
    const now = this.now();
    if (status === 'live') {
      const { phase } = timerState(startedAt, endsAt, now);
      if (phase === 'voorbij') {
        this.farewell = { since: now, spoken: false };
        this.set({ status: 'afscheid' });
        this.append('system', 'De tijd is om.');
        connection.sendText(TIME_CUES.voorbij);
      } else if (phase === 'slot' && !this.cues.slot) {
        this.cues.slot = true;
        this.cues.afronden = true;
        connection.sendContext(TIME_CUES.slot);
      } else if (phase === 'afronden' && !this.cues.afronden) {
        this.cues.afronden = true;
        connection.sendContext(TIME_CUES.afronden);
      }
      return;
    }
    if (status === 'afscheid' && this.farewell) {
      const { since, doneAt } = this.farewell;
      const spokenAndDone = doneAt !== undefined && now - doneAt >= VOICE.farewellGraceMs;
      if (spokenAndDone || now - since >= VOICE.farewellMaxMs) void this.hangUp('tijd');
    }
  }

  /**
   * Verleng het gesprek (bijvoorbeeld +5 minuten voor een credit). De denker hoort dat de tijd is
   * verlengd; de tijdsignalen gaan opnieuw zodra de nieuwe eindtijd nadert.
   */
  extend(extraMs: number): void {
    const { status, endsAt } = this.state;
    if (status !== 'live' || endsAt === undefined || extraMs <= 0) return;
    const next = Math.max(endsAt, this.now()) + extraMs;
    const remaining = next - this.now();
    this.cues = {
      afronden: remaining <= LIMITS.session.warnAtRemainingMinutes * 60_000,
      slot: remaining <= LIMITS.session.finalThoughtAtRemainingMinutes * 60_000,
    };
    this.set({ endsAt: next });
    this.connection?.sendContext(TIME_CUES.verlengd);
  }

  toggleMute(): void {
    if (!this.connection || this.isOver()) return;
    const muted = !this.state.muted;
    this.connection.setMuted(muted);
    this.set({ muted });
  }

  async hangUp(reason: CallEndReason = 'gebruiker'): Promise<void> {
    if (this.ending || this.isOver()) return;
    this.ending = true;
    this.stopTimer?.();
    this.stopTimer = undefined;
    const connection = this.connection;
    if (connection) await connection.end().catch(() => undefined);
    if (this.state.status === 'verbinden') {
      // Nog niet verbonden: er was geen gesprek, dus niets om te bewaren.
      this.set({ status: 'klaar' });
      return;
    }
    this.finish(reason);
  }

  private finish(reason: CallEndReason, error?: CallState['error']): void {
    if (this.isOver()) return;
    this.ending = true;
    this.stopTimer?.();
    this.stopTimer = undefined;
    this.set({
      status: 'beeindigd',
      endReason: reason,
      endedAt: this.now(),
      mode: 'luistert',
      error,
    });
    if (this.state.startedAt !== undefined) this.options.onEnded?.(this.state);
  }

  /** Bij het verlaten van de pagina: netjes ophangen en niemand meer informeren. */
  dispose(): void {
    void this.hangUp('gebruiker');
    this.listeners.clear();
  }
}
