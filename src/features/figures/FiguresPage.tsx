import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function FiguresPage() {
  useDocumentTitle(t.figures.title);
  return <PageHeader title={t.figures.title} intro="Deze pagina wordt nu gebouwd." />;
}
