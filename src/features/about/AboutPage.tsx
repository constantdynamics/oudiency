import { HeartHandshake, KeyRound, Landmark, Lock, Podcast, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { AiLabel } from '@/components/Badges';
import { Card } from '@/components/Card';
import { CrisisCard } from '@/components/CrisisCard';
import { PageHeader } from '@/components/PageHeader';
import { APP } from '@/config/app';
import { TOTAL_FIGURES } from '@/data/figures';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { t } from '@/i18n/nl';

function Section({
  id,
  icon,
  title,
  children,
}: {
  id: string;
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card as="section" aria-labelledby={id}>
      <h2 id={id} className="flex items-center gap-2 text-2xl">
        {icon}
        {title}
      </h2>
      <div className="mt-2 space-y-2 text-ink-2">{children}</div>
    </Card>
  );
}

/** Over & privacy: wat de app is, hoe je gegevens bewaard worden en waar je hulp vindt. */
export function AboutPage() {
  useDocumentTitle(`${t.nav.about} & privacy`);
  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <PageHeader
        title={`${t.nav.about} ${APP.name}`}
        intro={`${APP.tagline}. Praat op afspraak met grote denkers, volg colleges en zie wie er reageert op je gedachten.`}
      />
      <Section
        id="simulatie"
        icon={<Sparkles aria-hidden className="size-5 text-gold" />}
        title="Alles is een AI-simulatie"
      >
        <p>
          <AiLabel className="mr-2" />
          De gesprekken, colleges en reacties worden gemaakt door AI en zijn geïnspireerd op
          historische denkers. Het zijn geen echte uitspraken: ze kunnen fouten bevatten en zijn
          geen professioneel advies.
        </p>
        <p>
          De denkers weten dat ze een simulatie zijn en mogen naar het heden verwijzen. Letterlijke
          citaten komen alleen uit een gecontroleerde lijst met bron; verder spreken ze in eigen
          woorden. Leestips komen alleen uit hun echte werken.
        </p>
      </Section>
      <Section
        id="denkers"
        icon={<Landmark aria-hidden className="size-5 text-gold" />}
        title="De denkers"
      >
        <p>
          {TOTAL_FIGURES} denkers, allemaal overleden vóór 1950: acht uitgewerkte kerndenkers en een
          netwerk van leermeesters, tijdgenoten en tegenstanders die je gaandeweg ontdekt. Geen
          goden, geen beschermde personages en (in deze fase) geen religieuze stichters. De
          portretten zijn eigen medaillons, geen foto's.
        </p>
      </Section>
      <Section
        id="privacy"
        icon={<Lock aria-hidden className="size-5 text-gold" />}
        title="Privacy"
      >
        <p>
          In deze fase staat alles alleen op dit apparaat, in je browser. Er is geen account, geen
          tracking en geen analytics; lettertypen en afbeeldingen komen van deze site zelf.
        </p>
        <p>
          In{' '}
          <Link to="/profiel" className="text-fig underline underline-offset-2">
            je profiel
          </Link>{' '}
          kun je alles exporteren, terugzetten of wissen.
        </p>
      </Section>
      <Section
        id="sleutels"
        icon={<KeyRound aria-hidden className="size-5 text-gold" />}
        title="Je eigen sleutels"
      >
        <p>
          Zonder sleutel werkt alles in de demomodus. Met je eigen Anthropic-sleutel antwoorden de
          denkers echt; met een ElevenLabs-sleutel kun je ze bellen. Sleutels staan alleen in deze
          browser, gaan alleen naar de dienst zelf (api.anthropic.com of api.elevenlabs.io) en nooit
          mee in een export. Bij bellen bewaart ElevenLabs geen opname en wist het gesprek direct.
        </p>
      </Section>
      <Section
        id="podcasts"
        icon={<Podcast aria-hidden className="size-5 text-gold" />}
        title="Podcasts"
      >
        <p>
          Podcasts werken alleen met je eigen sleutels; in de demomodus zijn er geen podcasts.
          Claude schrijft de tekst. Daarbij gaan het onderwerp, je naam, samenvattingen van je
          eerdere sessies met die denkers en je recente berichten op de timeline mee, zodat de
          denkers je kennen. Sophie, de presentator, is een AI en zegt dat aan het begin van elke
          aflevering.
        </p>
        <p>
          ElevenLabs maakt er stemmen van. De audio staat daarna alleen op dit apparaat (wissen kan
          op de Podcasts-pagina) en gaat niet mee in een export. ElevenLabs bewaart wat het
          voorleest in de geschiedenis van je eigen ElevenLabs-account; daar kun je het ook wissen.
          Inbellen werkt zoals bellen: geen opname, en het gesprek wordt direct gewist.
        </p>
      </Section>
      <Section
        id="hulp"
        icon={<HeartHandshake aria-hidden className="size-5 text-gold" />}
        title="Als het even niet gaat"
      >
        <p>
          Merkt de app signalen van een crisis, dan stopt het rollenspel en zie je waar je
          terechtkunt. Je kunt hier altijd terecht:
        </p>
        <CrisisCard />
      </Section>
    </div>
  );
}
