/**
 * Repository-interfaces (§5.4). De UI leest reactief uit de Zustand-stores; alle schrijfacties
 * lopen via deze repositories. Fase 1: lokale implementaties bovenop de stores.
 * Fase 2: Supabase-implementaties met dezelfde interface (async), die de stores als cache bijwerken.
 */
import { useBookingStore } from './bookingStore';
import { useLectureStore } from './lectureStore';
import { usePostStore } from './postStore';
import { useProfileStore } from './profileStore';
import type { Booking, Lecture, LectureSegment, Message, Post, Reaction, Session, UserProfile } from './schemas';
import { useSessionStore } from './sessionStore';

export interface BookingRepo {
  list(): Promise<Booking[]>;
  get(id: string): Promise<Booking | undefined>;
  create(booking: Booking): Promise<Booking>;
  update(id: string, patch: Partial<Booking>): Promise<void>;
}

export interface SessionRepo {
  get(id: string): Promise<Session | undefined>;
  listByFigure(figureId: string): Promise<Session[]>;
  create(session: Session): Promise<Session>;
  update(id: string, patch: Partial<Session>): Promise<void>;
  appendMessage(id: string, message: Message): Promise<void>;
}

export interface LectureRepo {
  get(id: string): Promise<Lecture | undefined>;
  list(): Promise<Lecture[]>;
  create(lecture: Lecture): Promise<Lecture>;
  update(id: string, patch: Partial<Lecture>): Promise<void>;
  appendSegment(id: string, segment: LectureSegment): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface PostRepo {
  list(): Promise<Post[]>;
  create(post: Post): Promise<Post>;
  update(id: string, patch: Partial<Post>): Promise<void>;
  remove(id: string): Promise<void>;
  addReactions(id: string, reactions: Reaction[]): Promise<void>;
}

export interface ProfileRepo {
  get(): Promise<UserProfile>;
}

const localBookings: BookingRepo = {
  list: async () => useBookingStore.getState().bookings,
  get: async (id) => useBookingStore.getState().bookings.find((b) => b.id === id),
  create: async (booking) => {
    useBookingStore.getState().add(booking);
    return booking;
  },
  update: async (id, patch) => useBookingStore.getState().update(id, patch),
};

const localSessions: SessionRepo = {
  get: async (id) => useSessionStore.getState().sessions.find((s) => s.id === id),
  listByFigure: async (figureId) =>
    useSessionStore.getState().sessions.filter((s) => s.figureId === figureId),
  create: async (session) => {
    useSessionStore.getState().add(session);
    return session;
  },
  update: async (id, patch) => useSessionStore.getState().update(id, patch),
  appendMessage: async (id, message) => useSessionStore.getState().appendMessage(id, message),
};

const localLectures: LectureRepo = {
  get: async (id) => useLectureStore.getState().lectures.find((l) => l.id === id),
  list: async () => useLectureStore.getState().lectures,
  create: async (lecture) => {
    useLectureStore.getState().add(lecture);
    return lecture;
  },
  update: async (id, patch) => useLectureStore.getState().update(id, patch),
  appendSegment: async (id, segment) => useLectureStore.getState().appendSegment(id, segment),
  remove: async (id) => useLectureStore.getState().remove(id),
};

const localPosts: PostRepo = {
  list: async () => usePostStore.getState().posts,
  create: async (post) => {
    usePostStore.getState().add(post);
    return post;
  },
  update: async (id, patch) => usePostStore.getState().update(id, patch),
  remove: async (id) => usePostStore.getState().remove(id),
  addReactions: async (id, reactions) => usePostStore.getState().addReactions(id, reactions),
};

const localProfile: ProfileRepo = {
  get: async () => useProfileStore.getState().profile,
};

export const repos = {
  bookings: localBookings,
  sessions: localSessions,
  lectures: localLectures,
  posts: localPosts,
  profile: localProfile,
};
