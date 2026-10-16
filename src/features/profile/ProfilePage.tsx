import { AudioLines, ChevronRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { Pill } from '@/components/Badges';
import { PageHeader } from '@/components/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

export function ProfilePage() {
  useDocumentTitle(t.profile.title);
  return (
    <>
      <PageHeader title={t.profile.title} intro="Deze pagina wordt nu gebouwd." />
      <Link
        to="/profiel/stem"
        className="group flex max-w-xl items-center gap-4 rounded-2xl border border-line bg-card p-4 shadow-card transition-shadow hover:shadow-lift focus-visible:outline-3 focus-visible:outline-info"
      >
        <AudioLines aria-hidden className="size-8 shrink-0 text-gold" />
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 font-display text-xl font-semibold">
            Stem &amp; bellen <Pill tone="gold">Proef</Pill>
          </span>
          <span className="block text-ink-2">
            Bel live met Socrates: zet je ElevenLabs-sleutel en zijn stem klaar.
          </span>
        </span>
        <ChevronRight
          aria-hidden
          className="size-5 text-ink-3 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
      <Link
        to="/moderatie"
        className="group mt-3 flex max-w-xl items-center gap-4 rounded-2xl border border-line bg-card p-4 shadow-card transition-shadow hover:shadow-lift focus-visible:outline-3 focus-visible:outline-info"
      >
        <ShieldCheck aria-hidden className="size-8 shrink-0 text-gold" />
        <span className="min-w-0 flex-1">
          <span className="block font-display text-xl font-semibold">{t.moderation.pinTitle}</span>
          <span className="block text-ink-2">
            Keur colleges goed die iemand wil delen in de bibliotheek (met een pincode).
          </span>
        </span>
        <ChevronRight
          aria-hidden
          className="size-5 text-ink-3 transition-transform group-hover:translate-x-0.5"
        />
      </Link>
    </>
  );
}
