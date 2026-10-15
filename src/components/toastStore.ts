import { create } from 'zustand';
import { uid } from '@/lib/ids';

export interface Toast {
  id: string;
  text: string;
  tone: 'neutral' | 'ok' | 'warn' | 'danger';
}

interface ToastState {
  toasts: Toast[];
  push: (text: string, tone?: Toast['tone']) => void;
  dismiss: (id: string) => void;
}

/** Korte meldingen in beeld (niet opgeslagen). */
export const useToastStore = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (text, tone = 'neutral') => {
    const id = uid('toast');
    set((s) => ({ toasts: [...s.toasts.slice(-2), { id, text, tone }] }));
    setTimeout(() => get().dismiss(id), 4500);
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) })),
}));

export const toast = (text: string, tone?: Toast['tone']) => useToastStore.getState().push(text, tone);
