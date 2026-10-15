import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function DiscoverPage() {
  useDocumentTitle(t.discover.title);
  return <PageHeader title={t.discover.title} intro="Deze pagina wordt nu gebouwd." />;
}
