import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function TimelinePage() {
  useDocumentTitle(t.timeline.title);
  return <PageHeader title={t.timeline.title} intro="Deze pagina wordt nu gebouwd." />;
}
