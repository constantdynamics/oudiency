import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function ModerationPage() {
  useDocumentTitle(t.moderation.title);
  return <PageHeader title={t.moderation.title} intro="Deze pagina wordt nu gebouwd." />;
}
