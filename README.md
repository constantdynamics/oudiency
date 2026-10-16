# Oudiency

_Een levende filosofische universiteit_ (werktitel). Maak een afspraak met Socrates, vraag Kant om
een college over een onderwerp naar keuze en zie Spinoza reageren op je timeline.

> **AI-simulatie.** Alle gesprekken, colleges en reacties zijn gegenereerd door AI en geïnspireerd op
> historische denkers. Het zijn geen echte uitspraken, ze kunnen fouten bevatten en ze zijn geen
> professioneel advies.

- **Sessies op afspraak:** 15 minuten één-op-één, met een echte reservering, agenda-uitnodiging
  (.ics), timer, afscheid, samenvatting en geheugen van eerdere gesprekken.
- **Colleges:** kies een denker, een onderwerp en één hoofdvraag; het college bouwt op in delen, je
  mag drie vragen stellen en kunt het onbeperkt terugkijken.
- **Timeline:** schrijf je gedachten (ook n.a.v. een dagelijkse vraag); denkers uit het netwerk
  reageren met vertraging, en zo ontdek je nieuwe denkers.
- **Ontdekken:** topcolleges, trending, denker van de dag en "Wie kan mij helpen?".

Live (na de eenmalige stap hieronder): <https://constantdynamics.github.io/oudiency/>

## Fasering

| Fase | Inhoud                                                                                       |
| ---- | -------------------------------------------------------------------------------------------- |
| 1    | **Deze versie.** Volledig in de browser: demomodus of je eigen API-key; alle data lokaal.    |
| 2    | Gedeeld platform op Supabase: accounts, proxy met de key op de server, echte moderatiequeue. |
| 3    | Betalingen (Premium, credits).                                                               |
| 4    | Uitbreiding richting 100 denkers, voorlezen, installeerbare app, Engelse versie.             |

## Lokaal draaien

Vereist: Node 24 LTS (minimaal 20) en npm.

```bash
nvm use            # of installeer Node 24 via https://nodejs.org
npm ci
npm run dev        # → http://localhost:5173
```

Handig tijdens het testen: open de app met `?dev=1` (bijv. `http://localhost:5173/?dev=1`) voor het
**dev-paneel**: tijd verschuiven, naar de starttijd van je afspraak springen, de sessietimer
vooruitspoelen, daglimieten resetten, credits toevoegen, Premium aan/uit, reactievertraging op 0 en
wisselen tussen demo en eigen key.

| Commando                | Wat het doet                                                         |
| ----------------------- | -------------------------------------------------------------------- |
| `npm run dev`           | ontwikkelserver                                                      |
| `npm run build`         | typecheck + productiebuild in `dist/`                                |
| `npm run preview`       | de productiebuild lokaal bekijken                                    |
| `npm run lint`          | ESLint                                                               |
| `npm run format`        | Prettier (opmaak herstellen); `format:check` controleert alleen      |
| `npm test`              | unit-tests (Vitest)                                                  |
| `npm run validate:data` | controleert rooster en netwerken (o.a. iedereen overleden vóór 1950) |
| `npm run gen:index`     | genereert de lichte indexen na het wijzigen van denkers of colleges  |
| `npm run gen:assets`    | genereert favicon, app-iconen en social-preview (vereist Playwright) |

## Publiceren op GitHub Pages

De workflow `.github/workflows/deploy.yml` draait bij elke push: installeren → lint → opmaak →
tests → datavalidatie → build. Pushes naar de **standaardbranch** worden daarna gepubliceerd.

**Eenmalig (handmatig) in GitHub:**

1. Ga naar de repository → **Settings** → **Pages**
   (<https://github.com/constantdynamics/oudiency/settings/pages>).
2. Kies bij **Build and deployment → Source**: **GitHub Actions**.
3. Start de workflow opnieuw: **Actions** → **Build en deploy** → **Run workflow**
   (<https://github.com/constantdynamics/oudiency/actions>), of push een nieuwe commit.
4. De site staat daarna op <https://constantdynamics.github.io/oudiency/>.

Omdat de app een `HashRouter` en relatieve paden gebruikt (`base: './'`), werken deeplinks zoals
`…/oudiency/#/denkers/socrates` ook na herladen, onder elke reponaam.

## AI: demomodus of je eigen API-key

- **Zonder key** werkt alles in de **demomodus**: vooraf geschreven, in-karakter fragmenten met een
  gesimuleerde typesnelheid. Een banner laat zien dat je in de demomodus zit.
- **Met je eigen key (BYOK)** praat je met Claude, gestreamd en in het Nederlands:
  1. Maak een key op het Claude Developer Platform: <https://platform.claude.com/settings/keys>.
     Gebruik bij voorkeur een **aparte key met een lage bestedingslimiet**
     (<https://platform.claude.com/settings/limits>).
  2. Open in de app **Profiel → Instellingen → AI-bron**, plak de key en kies **Verbinding testen**
     (dat kost geen tokens).
  3. Met **Key wissen** haal je hem weer weg.

De key staat alleen in de localStorage van jouw browser, gaat alleen naar `api.anthropic.com` en
gaat nooit mee in een data-export. Deze manier is bedoeld voor de product owner en testers; in
Fase 2 bewaart een server-proxy de key.

Standaardmodellen per taak (aan te passen onder Profiel → Instellingen → Geavanceerd):

| Taak                                                              | Model               | Effort   |
| ----------------------------------------------------------------- | ------------------- | -------- |
| Sessies                                                           | `claude-sonnet-5-5` | `low`    |
| Colleges                                                          | `claude-sonnet-5-5` | `medium` |
| Timeline-reacties, samenvattingen, moderatie, hulpvraag, dagvraag | `claude-haiku-5-5`  | `low`    |

## Bellen met de denkers (proef)

Je kunt live, met je stem, met de denkers praten: als proefgesprek, of in een sessie op afspraak,
waar je bij de starttijd kiest tussen **Bellen** en **Typen**.

- **ElevenLabs Agents** luistert, spreekt en regelt de beurtwisseling (je kunt de denker gewoon
  onderbreken). Het brein is **Claude Sonnet 5.5**, via ElevenLabs; je hebt alleen een
  ElevenLabs-sleutel nodig.
- Eén gespreksagent in jouw ElevenLabs-account speelt alle denkers: per gesprek geeft de app de rol
  (hetzelfde kader en dezelfde persona als bij typen, plus spraakregels), de stem en de openingszin
  mee. Elke kerndenker krijgt een eigen ontworpen stem (Voice Design) met een licht accent van
  herkomst; nooit een kopie van een echte stem.
- Je hoort aan het begin altijd dat je met een AI-simulatie praat. Rond minuut 12 rondt de denker af,
  op 15 minuten neemt hij afscheid en hangt de app op.

**Instellen (eenmalig, ±5 minuten)**

1. Maak of open een account op <https://elevenlabs.io>. Voor live gesprekken heb je tegoed nodig;
   een betaald abonnement (Creator of hoger) werkt het best.
2. Klik links op **Developers** → tabblad **API Keys** → **Create API Key**
   (<https://elevenlabs.io/app/developers/api-keys>). Een nieuwe sleutel is standaard beperkt: zet
   toegang aan voor **ElevenLabs Agents** (schrijven), **Voices** (schrijven), **Text to Voice** en
   **User** (lezen). Stel eventueel een kredietlimiet in. Kopieer de sleutel meteen.
3. Open in de app **Profiel → Stem & bellen**
   (<https://constantdynamics.github.io/oudiency/#/profiel/stem>), plak de sleutel en kies
   **Opslaan en testen**.
4. Kies **Klaarzetten**: de app maakt in je account de agent “Oudiency · denkers (AI-simulatie)”
   aan (privé, zonder opnames, gesprekken worden bij ElevenLabs direct gewist).
5. Kies **Ontwerp de stem van Socrates**, beluister de drie voorbeelden en kies er één.
6. Kies **Bel Socrates**. Gebruik oortjes of een koptelefoon tegen echo.

**Privacy en kosten.** De sleutel staat alleen in de localStorage van je browser, gaat alleen naar
`api.elevenlabs.io` en nooit mee in een export. ElevenLabs neemt niets op (`record_voice: false`,
bewaartermijn 0); het transcript staat alleen lokaal. Indicatie: ongeveer $0,08 per minuut plus
Claude, zo'n $1,50–2 per gesprek van 15 minuten; na elk gesprek toont de app de echte kosten.

## Privacy

In Fase 1 blijft alles op je eigen apparaat (localStorage). Er is geen account, geen tracking en geen
analytics; lettertypen en afbeeldingen komen van dezelfde site. Onder **Profiel → Mijn data** kun je
alles exporteren (JSON), importeren en wissen. Alleen als je zelf een key instelt, gaan je berichten
naar Anthropic om een antwoord te maken; bij bellen gaat je stem via ElevenLabs (zie hierboven).

## Projectstructuur

```
.github/workflows/deploy.yml   CI + publicatie op GitHub Pages
public/                        favicon, iconen, manifest, og-image
scripts/                       validate-data, gen-index, gen-assets
src/app/                       router, layout, foutafhandeling, dev-toegang
src/config/                    app, limits, models, voice
src/i18n/                      UI-teksten (nl.ts; voice.ts laadt alleen met bellen)
src/data/figures/              één bestand per denker (core/ en network/) + gegenereerde index
src/data/demo/                 demomodus-fragmenten per kerndenker
src/ai/                        providerlaag (demo, eigen key, proxy-stub) en prompts
src/voice/                     bellen: ElevenLabs-API, agentconfig, gesprek, resampler
src/features/                  pagina's per onderdeel
src/store/                     Zustand-stores, persistentie, migraties, repositories
src/services/                  limieten, boekingen, sessietimer, achtergrondtaken
src/components/                Avatar, ThemeFrame, knoppen, dialogen, …
src/lib/                       klok, datums, ics, ranking, seeded random, markdown
tests/                         unit-tests
```

## Technische keuzes en afwijkingen van de briefing

- **Kleine startbundel** (doel: Lighthouse mobiel ≥ 90). Daarom:
  - de declaratieve `HashRouter` met `React.lazy` per pagina in plaats van de data-router
    (~17 kB gzip kleiner);
  - `zod/mini` voor de opslagschema's (~17 kB kleiner); de klassieke Zod-API alleen in de AI-code,
    die pas laadt als je hem gebruikt;
  - **geen date-fns**: eigen Nederlandse datumfuncties (`src/lib/dates.ts`, getest). Dat geeft
    overal dezelfde uitvoer en scheelt ~7 kB;
  - de Anthropic SDK, extra lettertypen en volledige denkersprofielen laden pas wanneer nodig.
- **Content-Security-Policy** via een `<meta>` in de productie-`index.html`: alleen eigen scripts en
  verbindingen met `api.anthropic.com`.

Meer context: `BRIEFING.md` (de oorspronkelijke opdracht), `CLAUDE.md` (projectregels) en
`CREDITS.md` (licenties en bronnen).
