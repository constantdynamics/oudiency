import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function ProfilePage() {
  useDocumentTitle(t.profile.title);
  return <PageHeader title={t.profile.title} intro="Deze pagina wordt nu gebouwd." />;
}
