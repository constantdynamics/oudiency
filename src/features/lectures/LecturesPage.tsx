import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function LecturesPage() {
  useDocumentTitle(t.lectures.title);
  return <PageHeader title={t.lectures.title} intro="Deze pagina wordt nu gebouwd." />;
}
