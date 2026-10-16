import { useEffect } from 'react';
import { APP } from '@/config/app';

/** Zet de paginatitel (belangrijk voor schermlezers en tabbladen). */
export function useDocumentTitle(title: string | undefined) {
  useEffect(() => {
    document.title = title ? `${title} · ${APP.name}` : `${APP.name} — ${APP.tagline}`;
  }, [title]);
}
