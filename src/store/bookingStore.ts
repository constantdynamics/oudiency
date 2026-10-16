import * as z from 'zod/mini';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { persistOptions, registerStore } from './persist';
import { BookingSchema, type Booking } from './schemas';

interface BookingState {
  bookings: Booking[];
  add: (booking: Booking) => void;
  update: (id: string, patch: Partial<Booking>) => void;
  remove: (id: string) => void;
}

const Persisted = z.object({ bookings: z.array(BookingSchema) });

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      add: (booking) => set((s) => ({ bookings: [...s.bookings, booking] })),
      update: (id, patch) =>
        set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) })),
      remove: (id) => set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) })),
    }),
    persistOptions<BookingState, { bookings: Booking[] }>({
      name: 'bookings',
      version: 1,
      schema: Persisted,
      partialize: (s) => ({ bookings: s.bookings }),
    }),
  ),
);

registerStore({
  name: 'bookings',
  version: 1,
  schema: Persisted,
  rehydrate: () => useBookingStore.persist.rehydrate(),
});
