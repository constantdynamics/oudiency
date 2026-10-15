import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function AboutPage() {
  useDocumentTitle(t.nav.about);
  return <PageHeader title={t.nav.about} intro="Deze pagina wordt nu gebouwd." />;
}
