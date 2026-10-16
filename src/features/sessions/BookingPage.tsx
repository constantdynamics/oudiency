import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function BookingPage() {
  useDocumentTitle(t.sessions.book);
  return <PageHeader title={t.sessions.book} intro="Deze pagina wordt nu gebouwd." />;
}
