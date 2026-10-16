import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function SessionsPage() {
  useDocumentTitle(t.sessions.title);
  return <PageHeader title={t.sessions.title} intro="Deze pagina wordt nu gebouwd." />;
}
