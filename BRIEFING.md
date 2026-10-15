<!-- Opdracht van de product owner (15 oktober 2026), overgenomen als naslag. De actuele projectregels staan in CLAUDE.md. -->

# Briefing: Oudiency (werktitel)

**Voor:** Claude Code
**Opdrachtgever:** de product owner (Nederlandstalig)
**Datum:** 15 oktober 2026 · **Versie:** 1.0
**Doel:** bouw een webapp, gehost op GitHub Pages, waarin gebruikers in gesprek gaan met grote denkers uit de geschiedenis, colleges volgen en een filosofische timeline delen.

> **Startinstructie**
>
> 1. Lees deze briefing volledig.
> 2. Stel alleen vragen als iets echt onduidelijk is, in het vraagformat uit §16. Waar een standaardkeuze staat, mag je die volgen.
> 3. Presenteer een kort bouwplan voor **Fase 1** (mijlpalen en volgorde) en begin na akkoord.
> 4. Leg de vaste projectregels vast in een beknopte `CLAUDE.md` (stack, commando's, §2 en §12), zodat volgende sessies die context hebben.

---

## Inhoud

1. Productvisie
2. Uitgangspunten (niet onderhandelbaar)
3. Fasering en scope
4. Informatiearchitectuur
5. Technische architectuur
6. Denkers: rooster en netwerk
7. Functionele specificatie
8. AI en prompts
9. Design en UX
10. Datamodel
11. Juridisch, ethisch en veiligheid
12. Valkuilen uit het prototype
13. Oplevering Fase 1: acceptatiecriteria
14. Open beslispunten
15. Roadmap
16. Werkafspraken

---

## 1. Productvisie

Een levende filosofische universiteit: je maakt een afspraak met Socrates, vraagt Kant om een college over een onderwerp naar keuze, en ziet Spinoza een bericht op je timeline liken. Oude wijsheid wordt persoonlijk, actueel en sociaal.

**Vier pijlers**

| Pijler               | Kern                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Persoonlijke sessies | Eén-op-één gesprek van 15 minuten op afspraak; 1 per dag (meer met Premium).                                                        |
| Colleges             | 1 per dag op aanvraag: onderwerp + één hoofdvraag, max. 3 tussenvragen. Delen op het platform na moderatie; onbeperkt terugkijken.  |
| Timeline             | Eigen berichten en wisselende reflectievragen; denkers liken of reageren wanneer het onderwerp hen raakt.                           |
| Denkersnetwerk       | Elke denker heeft een profiel-timeline (citaten, specificaties, levenslijn) en max. 10 geestverwanten; zo ontdek je nieuwe denkers. |

**Doelgroep:** volwassenen met interesse in geschiedenis en filosofie; professionals die inspiratie zoeken (leiderschap, ethiek); mensen die bezig zijn met persoonlijke ontwikkeling.

**Toon:** warm, nieuwsgierig en uitnodigend; serieus maar toegankelijk; een tikje speels. Geen schoolse uitstraling.

**Kenmerkend gevoel:** schaarste en aandacht. Een denker heeft maar een kwartier voor je; daarna wacht de volgende student. Dat maakt elk gesprek waardevol.

---

## 2. Uitgangspunten (niet onderhandelbaar)

1. **Nederlandstalig.** UI, gesprekken en content in het Nederlands. Denkers gebruiken af en toe een uitdrukking in hun eigen taal, altijd met vertaling.
2. **Juridisch veilig rooster.** Alleen personen die vóór 1950 zijn overleden. Geen levende of recent overleden personen, geen fictieve personages onder auteursrecht, geen goden.
3. **Transparant over AI.** Elk gesprek, college en elke reactie is zichtbaar gelabeld als AI-simulatie. Gebruikers moeten altijd weten dat ze met AI praten (ook met het oog op de transparantieregels uit de EU AI-verordening).
4. **Geen verzonnen citaten.** Letterlijke citaten alleen uit een geverifieerde lijst met bron; al het andere is herkenbaar parafrase (§8.5).
5. **Historische persoonlijkheid, moderne kennis.** Denkers kennen de wereld van nu en bekijken die vanuit hun eigen principes. Ze benoemen het als iets na hun tijd ligt.
6. **Werkt volledig op GitHub Pages.** Statische hosting: geen server, geen geheimen in de code (§5).
7. **Privacy by design (AVG).** In Fase 1 blijft alle data in de browser van de gebruiker. Geen tracking; fonts en assets self-hosted.
8. **Mobile-first en toegankelijk.** WCAG 2.2 AA als richtlijn.
9. **Feiten:** bij twijfel over een citaat, jaartal of relatie: opzoeken of weglaten.

---

## 3. Fasering en scope

GitHub Pages is statische hosting. Dat heeft twee gevolgen die de fasering bepalen:

- Een Claude API-key kan niet veilig in de site worden meegebakken; iedereen kan hem uitlezen.
- Gedeelde data (publieke bibliotheek, likes van anderen, moderatie, accounts) vraagt om een backend.

| Fase                        | Wat                                                                                                                                                                                                                                                  | Hosting                                       |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| **1 — MVP (deze opdracht)** | Alle vier pijlers volledig werkend voor één gebruiker. Data in de browser. AI via _demomodus_ (vooraf geschreven antwoorden) of _eigen API-key_ (BYOK). Moderatie, Premium en credits lokaal gesimuleerd.                                            | GitHub Pages                                  |
| **2 — Gedeeld platform**    | Accounts, database, Claude-proxy met de key server-side, serverside limieten, echte moderatiequeue, publieke bibliotheek met likes en trending, volgen, stemmen op collegeonderwerpen. Standaard: Supabase (Auth, Postgres met RLS, Edge Functions). | Frontend op GitHub Pages, backend op Supabase |
| **3 — Verdienmodel**        | Premium-abonnement en credits kopen (bv. Mollie of Stripe).                                                                                                                                                                                          | idem                                          |
| **4 — Uitbreiding**         | Meer denkers (richting 100), sociologen, extra functies (§15).                                                                                                                                                                                       | idem                                          |

**Ontwerpregel:** bouw Fase 1 zo dat Fase 2 een kwestie is van adapters vervangen, niet van herbouwen. AI-provider en opslag zitten achter interfaces (§5.3, §5.4).

---

## 4. Informatiearchitectuur

Routes (HashRouter):

| Route                           | Inhoud                                                                                                                   |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `#/`                            | **Ontdekken** (homepage): topcolleges, trending, aanbevolen, denker van de dag, "Wie kan mij helpen?", zoeken en filters |
| `#/timeline`                    | Eigen timeline met de reflectievraag van de dag                                                                          |
| `#/denkers` · `#/denkers/:id`   | Overzicht · profiel-timeline van een denker                                                                              |
| `#/sessies` · `#/sessies/:id`   | Boeken, komende afspraak, afspraakgeschiedenis · sessiescherm                                                            |
| `#/colleges` · `#/colleges/:id` | College aanvragen, mijn colleges · college (live of terugkijken)                                                         |
| `#/profiel`                     | Status, limieten, credits, statistieken, instellingen, mijn data                                                         |
| `#/moderatie`                   | Alleen zichtbaar in moderatormodus                                                                                       |
| `#/over`                        | Over het project, AI-disclaimer, privacy, bronnen en credits                                                             |

**Navigatie:** onderbalk op mobiel (Ontdekken · Timeline · Denkers · Sessies · Colleges), profiel via de avatar rechtsboven; op desktop een bovenbalk. Elke naam of avatar van een denker linkt naar diens profiel. Een bel-icoon toont meldingen: reacties van denkers, afspraken, moderatie-uitslagen.

---

## 5. Technische architectuur

### 5.1 Stack (standaardkeuze)

- **Vite + React + TypeScript** (strict)
- **Tailwind CSS** + CSS custom properties voor de thema's per denker
- **React Router** met `HashRouter` (deeplinks werken op GitHub Pages zonder server-rewrites)
- **Zustand** met persist-middleware (localStorage), schemaversie en migraties
- **Zod** voor validatie van opgeslagen data en AI-JSON
- **@anthropic-ai/sdk** (TypeScript SDK) voor de Claude API
- **lucide-react** (iconen), **@fontsource/** (self-hosted fonts), **date-fns** met `nl`-locale
- **Vitest** + Testing Library; Playwright optioneel voor 2–3 smoke-flows
- ESLint + Prettier; actuele Node LTS (minimaal 20) lokaal en in CI

Gebruik actuele stabiele versies (geen pre-releases) en controleer ze bij installatie.

### 5.2 Hosting en deploy

- `vite.config.ts`: `base: './'`. Met relatieve paden en HashRouter werkt de site onder elke reponaam.
- Workflow `.github/workflows/deploy.yml`: bij push naar `main` → `npm ci` → lint → test → `validate:data` → build → `dist` uploaden als Pages-artifact → deploy. Gebruik de officiële actions (`actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`, actuele majors) met `permissions: pages: write, id-token: write`.
- README: beschrijf de handmatige stap _Settings → Pages → Build and deployment → Source: GitHub Actions_.
- Content-Security-Policy via `<meta http-equiv>` in de productie-`index.html` (GitHub Pages ondersteunt geen eigen headers): `connect-src 'self' https://api.anthropic.com` (Fase 2: plus het Supabase-domein), geen externe scripts. Zo strikt als praktisch haalbaar.
- Geen secrets in de repo; `.env*` in `.gitignore`. Let op: alle `VITE_`-variabelen zijn publiek.

### 5.3 AI-laag (provider-patroon)

```ts
export interface AIProvider {
  readonly id: 'demo' | 'anthropic-browser' | 'proxy';
  streamText(
    req: TextRequest,
    onDelta: (chunk: string) => void,
    signal?: AbortSignal,
  ): Promise<TextResult>;
  structured<T>(req: StructuredRequest<T>): Promise<T>; // Zod-schema in req
}
```

| Provider                   | Wanneer               | Details                                                                                                                                                                                                                                                                                                                                                  |
| -------------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DemoProvider`             | Standaard, zonder key | Vooraf geschreven, in-karakter fragmenten (§8.8); gesimuleerde typesnelheid; banner "Demomodus".                                                                                                                                                                                                                                                         |
| `AnthropicBrowserProvider` | Eigen API-key (BYOK)  | Messages API vanuit de browser via de SDK met `dangerouslyAllowBrowser: true`; streaming aan. Key alleen in localStorage, alleen naar `api.anthropic.com`, met wisknop. Uitleg in de app: gebruik alleen je eigen key, bij voorkeur een aparte key met een lage bestedingslimiet. Bedoeld voor de product owner en testers, niet als publieke oplossing. |
| `ProxyProvider`            | Fase 2                | Zelfde interface; roept een Supabase Edge Function aan die de key bewaart en limieten afdwingt. In Fase 1 alleen een stub.                                                                                                                                                                                                                               |

Verdere afspraken:

- **Modellen per taak** in `src/config/models.ts` (§8.7), aanpasbaar via instellingen (geavanceerd).
- **Structured output** voor JSON-taken: `output_config.format` via de SDK-helper `zodOutputFormat()` met `client.messages.parse()`.
- **Effort** expliciet zetten via `output_config.effort` en binnen één gesprek constant houden; een wisseling breekt de prompt-cache.
- **Prompt caching:** statische systeemprompt (kader + persona) vooraan en cachebaar; dynamische context achteraan (§8.2). Controleer de minimale cachebare lengte in de docs.
- **Fouten:** de SDK doet zelf al retries. Toon daarna een in-karakter melding met "Probeer opnieuw". Vang `stop_reason: "refusal"` netjes af (vriendelijke melding, geen kapotte UI).
- **Verbruik:** log `usage` (input- en output-tokens) per call; toon in Profiel → Verbruik een schatting op basis van een prijstabel in config.
- **AI-tekst veilig renderen:** beperkte markdown (vet, cursief, lijstjes) via een sanitizende renderer; nooit `dangerouslySetInnerHTML` met ruwe modeltekst.
- **Bronnen** (controleer actuele details vóór implementatie): [Models overview](https://platform.claude.com/docs/en/models/overview) · [TypeScript SDK](https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript) · [Structured outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs) · [Effort](https://platform.claude.com/docs/en/build-with-claude/effort) · [Prompt caching](https://platform.claude.com/docs/en/build-with-claude/prompt-caching) · [Pricing](https://platform.claude.com/docs/en/about-claude/pricing)

### 5.4 Opslag

- Fase 1: Zustand-stores met persist, één namespace (bv. `fu:v1:`), schemaversie en migraties.
- Repository-interfaces (`BookingRepo`, `SessionRepo`, `LectureRepo`, `PostRepo`, `ProfileRepo`), zodat Fase 2 Supabase-implementaties kan inpluggen.
- Profiel → **Mijn data**: exporteren (JSON), importeren, alles wissen.
- **Klok-abstractie** `clock.now()` overal in de domeinlogica (nooit direct `Date.now()`), zodat tijd in tests en in dev-modus te verschuiven is.
- Limietlogica in één service (`limits.service.ts`), zodat Fase 2 dezelfde regels serverside kan afdwingen.

### 5.5 Mappenstructuur (voorstel)

```
.
├─ .github/workflows/deploy.yml
├─ public/                       # favicon, manifest, og-image
├─ scripts/validate-data.ts      # datavalidatie (§6.4)
├─ src/
│  ├─ app/                       # router, layout, providers
│  ├─ config/                    # limits.ts, models.ts, app.ts
│  ├─ i18n/nl.ts                 # alle UI-teksten centraal
│  ├─ data/
│  │  ├─ figures/                # één bestand per denker (kern + netwerk)
│  │  ├─ prompts/daily-questions.ts
│  │  ├─ demo/                   # demomodus-fragmenten per denker
│  │  └─ seed/lectures/          # voorbeeldcolleges
│  ├─ ai/
│  │  ├─ provider.ts · demoProvider.ts · anthropicBrowserProvider.ts · proxyProvider.ts
│  │  └─ prompts/                # session.ts, lecture.ts, timeline.ts, safety.ts
│  ├─ features/
│  │  ├─ discover/ · timeline/ · figures/ · sessions/ · lectures/
│  │  └─ profile/ · moderation/ · share/
│  ├─ store/                     # stores, persist, migraties, repos
│  ├─ components/                # Avatar, ThemeFrame, Chat, Timer, QuoteCard, …
│  ├─ styles/                    # tokens.css, figure-themes.css
│  └─ lib/                       # clock, ics, ranking, seeded-rng, share-card, sanitize
├─ tests/
└─ BRIEFING.md · CLAUDE.md · README.md · CREDITS.md
```

### 5.6 Dev-hulpmiddelen

Een dev-paneel (alleen in dev of met `?dev=1`): tijd verschuiven (naar de starttijd van een slot, timer vooruitspoelen), daglimieten resetten, credits toevoegen, Premium aan/uit, reactievertraging op 0, wisselen tussen demo en eigen key. Onmisbaar om de tijdgebonden functies te testen.

---

## 6. Denkers: rooster en netwerk

### 6.1 Kerndenkers (Fase 1, volledig uitgewerkt)

| id         | Naam                  | Leefde                                              | Kern                                                 | Eigen taal                                                 | Visueel motief                                  |
| ---------- | --------------------- | --------------------------------------------------- | ---------------------------------------------------- | ---------------------------------------------------------- | ----------------------------------------------- |
| `socrates` | Socrates              | ca. 470–399 v.Chr.                                  | Socratische methode, ethiek, deugd                   | Oudgrieks                                                  | meander, marmer, olijftak                       |
| `aurelius` | Marcus Aurelius       | 121–180                                             | Stoïcisme, leiderschap, veerkracht                   | Latijn; Grieks (de _Meditaties_ schreef hij in het Grieks) | Romeins rood, lauwerkrans, brons                |
| `laozi`    | Laozi (Lao Tzu)       | traditioneel 6e eeuw v.Chr. (historiciteit onzeker) | Taoïsme, wu wei, eenvoud                             | klassiek Chinees                                           | inktwas, water, bamboe                          |
| `kant`     | Immanuel Kant         | 1724–1804                                           | Kritische filosofie, plichtethiek, Verlichting       | Duits                                                      | sterrenhemel, Königsberg-blauw, kompas          |
| `franklin` | Benjamin Franklin     | 1706–1790                                           | Praktische wijsheid, zelfverbetering, wetenschap     | Engels (18e eeuw)                                          | vlieger en bliksem, drukpers, perkament         |
| `gandhi`   | Mahatma Gandhi        | 1869–1948                                           | Geweldloosheid (ahimsa), satyagraha, eenvoud         | Gujarati en Hindi, Sanskrietbegrippen                      | spinnewiel (charkha), khadi, saffraan           |
| `spinoza`  | Baruch de Spinoza     | 1632–1677                                           | Rationalisme, _Deus sive Natura_, vrijheid, affecten | Latijn (ook Nederlands en Portugees)                       | geslepen lens, lichtbreking, Hollands licht     |
| `rousseau` | Jean-Jacques Rousseau | 1712–1778                                           | Sociaal contract, vrijheid, opvoeding, natuur        | Frans                                                      | botanische tekening, meer van Genève, wandelpad |

**Ankercitaat per kerndenker.** Deze laten het vereiste niveau zien: kort, met exacte bron, zelf vertaald uit het origineel.

| Denker          | Citaat (eigen vertaling)                                                         | Bron                                                 |
| --------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Socrates        | "Een leven zonder onderzoek is voor een mens het leven niet waard."              | Plato, _Apologie_ 38a                                |
| Marcus Aurelius | "Het heelal is verandering, het leven is opvatting."                             | _Meditaties_ 4.3                                     |
| Laozi           | "Een reis van duizend mijl begint onder je voeten."                              | _Daodejing_ 64                                       |
| Kant            | "Sapere aude! Heb de moed je eigen verstand te gebruiken."                       | _Beantwortung der Frage: Was ist Aufklärung?_ (1784) |
| Franklin        | "Goed gedaan is beter dan goed gezegd."                                          | _Poor Richard's Almanack_ (1737)                     |
| Gandhi          | "Geweldloosheid is de wet van onze soort, zoals geweld de wet van het beest is." | "The Doctrine of the Sword", _Young India_ (1920)    |
| Spinoza         | "Niet lachen, niet betreuren, niet verafschuwen, maar begrijpen."                | _Tractatus politicus_ I.4                            |
| Rousseau        | "De mens is vrij geboren, en overal ligt hij in ketenen."                        | _Du contrat social_ I.1                              |

### 6.2 Netwerk per kerndenker (max. 10, met relatietype)

Het relatietype beschrijft wie de genoemde persoon was ten opzichte van de kerndenker (_invloed_ = beïnvloedde de kerndenker; _navolger_ = liet zich door de kerndenker inspireren). Het eerste woord tussen haakjes is het relatietype uit §10; wat na de komma volgt is een toelichting (`note`).

- **Socrates:** Plato (leerling) · Xenophon (leerling) · Aristoteles (navolger, via Plato) · Protagoras (gesprekspartner, sofist) · Diogenes van Sinope (geestverwant) · Zeno van Citium (navolger) · Epictetus (navolger) · Marcus Aurelius (navolger) · Michel de Montaigne (geestverwant) · Søren Kierkegaard (navolger)
- **Marcus Aurelius:** Epictetus (invloed) · Seneca (invloed) · Zeno van Citium (invloed, grondlegger van de Stoa) · Chrysippus (invloed) · Musonius Rufus (invloed, leraar van Epictetus) · Junius Rusticus (leraar) · Cornelius Fronto (leraar, retorica) · Antoninus Pius (voorbeeld, adoptievader) · Heraclitus (invloed) · Socrates (voorbeeld)
- **Laozi:** Zhuangzi (navolger) · Liezi (navolger) · Yang Zhu (geestverwant) · Confucius (gesprekspartner, volgens de overlevering) · Mencius (andere school) · Mozi (andere school) · Han Feizi (commentator) · Wang Bi (commentator) · Nagarjuna (geestverwant, vergelijkende filosofie) · Leo Tolstoj (bewonderaar, werkte aan een vertaling)
- **Kant:** David Hume (invloed, wekte hem uit zijn "dogmatische sluimer") · Jean-Jacques Rousseau (invloed) · Gottfried Wilhelm Leibniz (invloed) · Christian Wolff (invloed) · Isaac Newton (invloed) · Moses Mendelssohn (correspondent, tijdgenoot) · Johann Gottfried Herder (leerling, later criticus) · Johann Gottlieb Fichte (navolger) · G.W.F. Hegel (navolger, ook criticus) · Arthur Schopenhauer (bewonderaar, ook criticus)
- **Franklin:** Thomas Jefferson (tijdgenoot) · John Adams (tijdgenoot) · Thomas Paine (protegé) · Voltaire (tijdgenoot, ontmoeting in Parijs) · David Hume (vriend) · Adam Smith (tijdgenoot) · Joseph Priestley (vriend) · Cotton Mather (invloed) · John Locke (invloed) · Socrates (voorbeeld, Franklin nam de Socratische methode over)
- **Gandhi:** Leo Tolstoj (invloed, correspondent) · Henry David Thoreau (invloed) · John Ruskin (invloed, _Unto This Last_) · Rabindranath Tagore (vriend, ook criticus) · Gopal Krishna Gokhale (mentor) · Shrimad Rajchandra (mentor, spiritueel raadgever) · Dadabhai Naoroji (voorbeeld) · Ralph Waldo Emerson (invloed) · Annie Besant (tijdgenoot) · Socrates (invloed, Gandhi bewerkte Plato's _Apologie_ in het Gujarati)
- **Spinoza:** René Descartes (invloed) · Thomas Hobbes (invloed) · Maimonides (invloed, kritisch gelezen) · Franciscus van den Enden (leraar) · Gottfried Wilhelm Leibniz (criticus, bezocht hem in Den Haag) · Henry Oldenburg (correspondent) · Johan de Witt (tijdgenoot) · Christiaan Huygens (tijdgenoot, lenzen en optica) · Johann Wolfgang von Goethe (bewonderaar) · Friedrich Nietzsche (bewonderaar)
- **Rousseau:** Voltaire (rivaal) · Denis Diderot (vriend, later breuk) · David Hume (vriend, gastheer in Engeland, later ruzie) · Montesquieu (invloed) · Thomas Hobbes (tegenpool) · John Locke (invloed) · Immanuel Kant (bewonderaar) · Mary Wollstonecraft (criticus, bekritiseerde _Émile_) · Johann Heinrich Pestalozzi (navolger) · Plutarchus (invloed, jeugdlectuur)

### 6.3 Regels voor het netwerk

- Netwerkdenkers krijgen een compact profiel (§10): jaren, herkomst, stroming, bio van 2–4 zinnen, 2–3 citaten (alleen met zekere bron; liever minder), 3–5 levensgebeurtenissen, kernbegrippen, thema-tags en een eigen netwerk (max. 10, alleen bestaande profielen).
- Leid relaties symmetrisch af (leraar ↔ leerling, invloed ↔ navolger) en vul aan tot max. 10.
- Ook netwerkdenkers zijn bespreekbaar en kunnen colleges geven; hun persona wordt uit het profiel opgebouwd. Kerndenkers hebben een rijkere, handgeschreven persona.
- Houd per denker de status "ontdekt" bij ("23 van 73 denkers ontdekt").

### 6.4 Datavalidatie (`npm run validate:data`, ook in CI)

- **Faalt bij:** netwerk-id zonder profiel · netwerk groter dan 10 · sterfjaar 1950 of later · citaat zonder bron of status · dubbele id's · ontbrekende verplichte velden.
- **Waarschuwt bij:** citaten met `verified: false`.

### 6.5 Profiel-timeline van een denker (`#/denkers/:id`)

- **Kop:** avatar in thema, naam (plus eigen schrift, bv. Σωκράτης, 老子), jaren, herkomst, stroming, kernbegrippen als chips. Knoppen: **Volgen** · **Plan een sessie** · **Vraag een college aan**.
- **Feed** van kaarten:
  - _Citaat_: geverifieerd, met bron en statuslabel.
  - _Specificatie_: bv. "Hoofdwerk: _Ethica_ (1677, postuum verschenen)".
  - _Levensgebeurtenis_: jaartal plus korte tekst; samen vormen ze een levenslijn.
  - _Gedachte van vandaag_ (optioneel, AI, gelabeld): max. 1 per dag per denker, lokaal gecachet.
- **Netwerk:** max. 10 geestverwanten met relatietype; nog niet ontdekte denkers als teaserkaart.
- **Colleges** van deze denker uit de bibliotheek.

---

## 7. Functionele specificatie

Alle getallen hieronder staan als standaardwaarde in `src/config/limits.ts`.

### 7.1 Persoonlijke sessies

**Regels**

- Duur 15 minuten. Zachte waarschuwing na 12 minuten (nog 3 minuten): de denker begint af te ronden. Harde stop na 15 minuten met een afscheid ("… moet nu door naar een andere student").
- Gratis: 1 sessie per kalenderdag (lokale tijd). Premium: 3 per dag.
- Verlengen: +5 minuten voor 1 credit, max. 2× per sessie; de knop verschijnt vanaf de waarschuwing.
- Na afloop altijd de optie **Plan een nieuwe sessie**.

**Boeken (reservering met bevestiging)**

1. Kies een denker en zie het spreekuur voor vandaag en de komende 7 dagen: slots van 15 minuten, 6–8 per dag tussen 09:00 en 21:00, per denker iets anders.
2. Een deel van de slots is _"Bezet — in gesprek met een andere student"_. Dit is deterministisch gesimuleerd (seed = datum + denker), zodat het na herladen gelijk blijft.
3. Optioneel: in één zin aangeven waarover je wilt praten; dit wordt in de opening gebruikt.
4. Bevestigingsscherm met afspraakkaart en een **.ics-download** ("Zet in je agenda").
5. Annuleren of verzetten kan tot de starttijd; de dagplek komt dan weer vrij.

- Starten kan vanaf de starttijd tot 10 minuten erna ("de deur staat open"). Daarna: _afspraak gemist_, en de dagplek komt weer vrij.
- In-app melding bij de starttijd; optioneel een browsernotificatie als het tabblad open is.

**Sessiescherm**

- Kop: avatar met staten (luistert / denkt / spreekt), naam, timer (groen > 5 min, oranje 3–5 min, rood < 3 min), AI-label.
- Chat met streaming. Enter = versturen, Shift+Enter = nieuwe regel. Knop "Gesprek beëindigen".
- De timer is gebaseerd op een opgeslagen `endsAt`-tijdstempel (geen aftellende state), zodat hij klopt na herladen of een tabwissel.
- Tijd die verloren gaat door API-fouten wordt gecompenseerd (max. 2 minuten per sessie).
- **Deel een fragment:** een bericht van de denker als citaatkaart delen (§7.6).
- Einde: afscheidsbericht → invoer dicht → automatisch een samenvatting (3–5 zinnen) en één reflectievraag om mee te nemen → opgeslagen in de **afspraakgeschiedenis**.
- **Geheugen:** bij een volgende sessie met dezelfde denker gaan de samenvattingen van de laatste 3 sessies mee als context ("Vorige keer spraken we over …").

### 7.2 Colleges

**Regels**

- Gratis: 1 college aanvragen per dag. Premium: 3 per dag.
- Afgeronde colleges (eigen colleges en die uit de bibliotheek) onbeperkt terugkijken.
- Bewust **geen** commentaarsectie bij colleges.

**Aanvraag:** kies een docent, een **onderwerp** (max. 80 tekens) en **één hoofdvraag** (max. 200 tekens). Meer niet.

**Opbouw (interactief)**

1. Eerst een onzichtbaar **collegeplan** (structured output): titel en 3 delen met kernpunten.
2. Opening (een pakkend begin en waarom deze vraag ertoe doet) → Deel 1 → Deel 2 → Deel 3 → Conclusie.
3. Na elk deel: **Vraag stellen** of **Ga verder**. In totaal max. **3 vragen**, met zichtbare teller. De docent beantwoordt de vraag en vervlecht het antwoord met het volgende deel.
4. Conclusie: beantwoordt de hoofdvraag, geeft 3 kernlessen, 1 denkvraag en _Verder lezen_ (alleen werken uit `keyWorks` van de persona, nooit verzonnen titels).

- Doellengte: 12–15 minuten leestijd in totaal (configureerbaar).
- Weergave: een collegezaal in het thema van de docent, delen als hoofdstukken met voortgangsbalk, streaming, rustige leestypografie.

**Na afloop:** Vind ik leuk · **Deel op het platform** (→ moderatie, §7.5) · **Deel een highlight** (§7.6) · **Terugkijken**.

**Terugkijken:** transcript met hoofdstuknavigatie en een _afspeelmodus_ waarin de tekst in leestempo verschijnt (pauzeerbaar).

### 7.3 Timeline (eigen)

- **Composer:** "Wat houdt je bezig?" (max. 500 tekens), optionele hashtags. Eigen berichten bewerken, verwijderen en liken.
- **Reflectievraag van de dag:** elke dag anders, gesteld door een (gevolgde) denker in diens stijl ("Marcus Aurelius vraagt: …").
  - Pool van minstens 60 vragen in verschillende soorten: persoonlijk, ethisch dilemma, gedachte-experiment, samenleving, werk, relaties, dankbaarheid.
  - Geen herhaling binnen 30 dagen; seed op datum. Max. 1× per dag "andere vraag". Na beantwoorden kan later die dag één vervolgvraag verschijnen.
  - Voorbeelden van de toon: _"Waar ben je deze week van mening veranderd, al was het maar een beetje?"_ · _"Wat bezit jij, en wat bezit jou?"_ · _"Welke regel volg je die je nooit hebt onderzocht?"_ · _"Wanneer voelde je je het meest vrij?"_ · _"Waar maak je je zorgen over dat niet in jouw macht ligt?"_
- **Reacties van denkers:**
  - Na plaatsen bepaalt één lichte AI-call (structured output) welke 0–3 denkers zich aangesproken voelen. Kandidaten: gevolgde denkers, kerndenkers en een handvol nog niet ontdekte netwerkdenkers met overlappende thema-tags.
  - Per denker: alleen een like (meestal), of een like met een korte reactie (max. ~60 woorden) in eigen stijl, eventueel met een wedervraag.
  - **Niet elk bericht krijgt reacties.** Dat maakt het geloofwaardig.
  - Realistische vertraging: elke reactie krijgt een verschijntijd (1–20 minuten na plaatsen) en verschijnt pas dan, met een melding ("Spinoza reageerde op je bericht").
  - Ontdekken: bij ongeveer één op de drie reactierondes mag één nog niet ontdekte netwerkdenker reageren → "Nieuw ontdekt: Epictetus" → profiel bekijken, sessie plannen of college aanvragen.
  - Onder een reactie: "Hier dieper op ingaan? Plan een sessie met …" (binnen de limieten).
- Bij signalen van crisis in een bericht: geen rollenspelreacties, maar een zorgzame melding van de app zelf met hulpbronnen (§8.4).
- Fase 2: berichten standaard privé, per bericht openbaar te maken (met moderatie).

### 7.4 Ontdekken (homepage)

- **Topcolleges:** best gewaardeerd (meeste likes). In Fase 1 zijn dat je eigen favorieten plus de voorbeeldcolleges; in Fase 2 de hele community.
- **Trending:** likes van de afgelopen 7 dagen met tijdsverval, bv. `score = likes / (uren_sinds_publicatie + 2)^1,5` (unit-getest).
- **Aanbevolen voor jou:** op basis van eerdere colleges, gevolgde denkers en thema's.
- **Trending onderwerpen en populaire vragen**, afgeleid uit de bibliotheek.
- **Denker van de dag**, bij voorkeur een nog niet ontdekte netwerkdenker.
- **"Wie kan mij helpen?":** de gebruiker typt een vraag of probleem; de app stelt 3 passende denkers voor met één zin waarom → sessie plannen of college aanvragen.
- **Zoeken** (titel, onderwerp, hoofdvraag, denker) en **filters** (denker, thema, lengte).
- **Inhoud in Fase 1:** ongeveer 12 voorbeeldcolleges die jij in karakter schrijft (minstens één per kerndenker), duidelijk gelabeld als _Voorbeeld_. Geen verzonnen gebruikersnamen of like-aantallen; in Fase 1 tellen alleen je eigen likes. Ideeën voor onderwerpen:
  - Socrates: _Is sociale media een agora?_
  - Marcus Aurelius: _Kalm blijven in een wereld vol nieuws_
  - Laozi: _Wu wei in een prestatiemaatschappij_
  - Kant: _Mag je liegen om iemand te beschermen?_
  - Franklin: _Gewoontes die werken_
  - Gandhi: _Werkt geweldloos verzet vandaag nog?_
  - Spinoza: _Emoties begrijpen in plaats van onderdrukken_
  - Rousseau: _Maakt de smartphone ons minder vrij?_

### 7.5 Moderatie

- **Fase 1:** "Deel op het platform" → status `ingediend` → automatische pre-check (lichte AI-call op persoonsgegevens, haat, expliciete of anderszins schadelijke inhoud; resultaat als advies) → in de **moderatormodus** (instelling met lokale pincode) keurt een moderator goed of af, met reden → `goedgekeurd` verschijnt in de bibliotheek; bij `afgekeurd` ziet de maker de reden.
- **Fase 2:** echte queue in de database, rol `moderator`, RLS-policies.

### 7.6 Delen naar sociale media

- **Highlight delen** uit een college of sessie: kies een passage (max. ~200 tekens) → citaatkaart als PNG (canvas) in het thema van de denker, met naam, titel en het label _"AI-simulatie · [appnaam]"_ → Web Share API (mobiel) of downloaden en tekst kopiëren.
- De kaart presenteert de tekst nooit als echt citaat van de historische persoon; het is herkenbaar een fragment uit een AI-gesprek.

### 7.7 Profiel en limieten

- **Status:** weergavenaam, Basis of Premium (Fase 1: schakelaar _Premium simuleren_), credits (start met 2).
- **Vandaag:** sessies x/y en colleges x/y; reset om 00:00 lokale tijd.
- **Statistieken:** gesprekken, colleges gevolgd en gemaakt, ontdekte denkers (x/y), favoriete denkers.
- **Overzichten:** afspraakgeschiedenis (met samenvattingen), mijn colleges, gevolgde denkers, verbruik (bij eigen key).
- **Instellingen:** AI-bron (demo of eigen API-key), modellen per taak (geavanceerd), meldingen, moderatormodus, mijn data.

---

## 8. AI en prompts

### 8.1 Persona-blad

Elke denker heeft een persona in `src/data/figures/<id>.ts` (type in §10). Kerndenkers krijgen een rijke, handgeschreven persona. De belangrijkste onderdelen:

- **Stem:** register, gespreksmethode, retorische gewoontes, typische beelden, uitdrukkingen in eigen taal met vertaling, en wat te vermijden.
- **Methode per kerndenker:**
  - Socrates: elenchus, veel wedervragen, ironisch-bescheiden.
  - Marcus Aurelius: zelfaanspraak, plicht, vergankelijkheid.
  - Laozi: paradox, beeldspraak, kort.
  - Kant: systematisch, scherpe onderscheidingen, universaliseerbaarheid.
  - Franklin: praktisch, anekdotes, deugdenschema, humor.
  - Gandhi: persoonlijke ervaring, eenvoud, zelfonderzoek.
  - Spinoza: rustig, geometrisch redenerend, affecten begrijpen.
  - Rousseau: gepassioneerd, autobiografisch, natuur tegenover samenleving.
- **Ook ingetogen denkers zijn boeiend:** Spinoza, Kant en Laozi blijven herkenbaar ingetogen, maar zijn uitnodigend en warm.
- **Moderne lens:** hoe deze denker naar het heden kijkt.
- **Schaduwkanten** (`controversies`): eerlijk te benoemen kwesties, bijvoorbeeld Kants rassentheorieën, Rousseau die zijn kinderen naar het vondelingenhuis bracht, en Gandhi's vroege uitspraken over zwarte Zuid-Afrikanen.
- **Kernwerken** (`keyWorks`): de enige titels waarnaar verwezen mag worden.

### 8.2 Opbouw systeemprompt (sessie)

1. **Kader** (gedeeld, cachebaar): rol en AI-simulatie, taal, veiligheidsregels, citatenbeleid, omgang met moderne kennis en actuele politiek.
2. **Persona** (cachebaar).
3. **Sessiecontext:** samenvattingen van eerdere sessies, eventueel opgegeven onderwerp.
4. **Per beurt**, als apart tekstblok in het laatste gebruikersbericht (niet gecachet): bv. `[beurt 7 · verstreken 9:40 · resterend 5:20]`.

**Gedragsregels**

- **Adaptieve diepgang**, zonder vaste niveaus: begin toegankelijk; ga dieper naarmate de gebruiker dieper gaat (langere, reflectievere berichten, doorvragen op begrippen); terug naar eenvoud als de gebruiker afhaakt. Een snelle vraag krijgt een kort antwoord; een diep gesprek mag diep gaan.
- **Lengte:** 60–150 woorden per beurt (Laozi korter), tenzij de gebruiker om meer vraagt.
- **Tijd:** bij 3 minuten of minder resterend kernachtig afronden; bij 1 minuut of minder een slotgedachte. Na de tijd sluit de app af met het afscheid.
- **Moderne kennis:** de denker kent de wereld van nu, benoemt wat na zijn tijd ligt ("In mijn tijd bestond dit niet, maar …") en past zijn principes erop toe.
- **Actuele politiek:** redeneren vanuit principes en meerdere kanten belichten; geen stemadvies en geen oordeel over huidige partijen of politici.
- **Schaduwkanten:** als ernaar gevraagd, eerlijk en kritisch erkennen vanuit het heden; niet goedpraten en niets kwetsends herhalen.
- **Echtheid:** vraagt de gebruiker oprecht of hij met de echte persoon praat, dan bevestigt de denker dat dit een AI-simulatie is.

### 8.3 College-prompts

- **Plan-call** (structured output): `{ title, segments: [{ heading, keyPoints[] }] }`.
- **Segment-call:** kader + persona + plan + samenvatting van eerdere delen + eventuele vraag van de student → gestreamde tekst.
- De docent spreekt de student direct aan, stelt retorische vragen en gebruikt voorbeelden uit de eigen tijd én uit het heden.
- **Conclusie** met vaste structuur: kernlessen, denkvraag, verder lezen uit `keyWorks`.

### 8.4 Veiligheid (geldt voor alle prompts)

De denker stapt kort, warm en duidelijk uit de rol bij:

- **Signalen van crisis of suïcidaliteit:** verwijs naar 113 Zelfmoordpreventie (bel 113 of gratis 0800-0113, of chat via 113.nl); bij acuut gevaar 112. De app toont daarnaast een vaste hulpkaart.
- **Vragen om medisch, juridisch of financieel advies:** algemene overwegingen plus een verwijzing naar een professional.
- **Verzoeken om schadelijke, haatdragende of expliciete inhoud:** weigeren.

Leg dit vast in `src/ai/prompts/safety.ts`, voeg een eenvoudige app-side check op signaalwoorden toe als vangnet, en test de crisisroute expliciet (ook in demomodus).

### 8.5 Citatenbeleid en bronnen

- Elk citaat in de data heeft: Nederlandse tekst, optioneel het origineel, de bron (werk + passage), een status (`authentiek`, `parafrase` of `toegeschreven`) en `verified`.
- **Vertalingen:** eigen vertaling uit het origineel of uit een vertaling in het publieke domein. Neem geen tekst over uit moderne, auteursrechtelijk beschermde vertalingen.
- **Pas op met "bekende" citaten:** veel zijn onjuist toegeschreven of losse parafrases. "Wees de verandering die je in de wereld wilt zien" staat zo niet in Gandhi's werk; het is een vrije samenvatting van een langere passage. "Ik weet dat ik niets weet" is een parafrase van Plato's _Apologie_ 21d, geen letterlijk citaat. Gebruik zulke zinnen alleen met status `parafrase` of `toegeschreven` en een korte toelichting, of niet.
- In gesprekken citeert een denker letterlijk alleen uit de geverifieerde lijst; anders spreekt hij "in eigen woorden".
- De UI toont standaard alleen citaten met `verified: true`.

### 8.6 Timeline-reacties

- Eén structured-output-call met een licht model. Input: het bericht plus een kandidatenlijst (id, naam, één regel thema's). Output: `{ reactions: [{ figureId, type: "like" | "comment", text? }] }` met 0–3 items.
- Valideer met Zod en controleer dat elk `figureId` in de kandidatenlijst stond. Bij een fout: geen reacties (stil falen, wel loggen).

### 8.7 Modellen per taak (standaard, configureerbaar)

| Taak                                                                                                                  | Model               | Effort            | Toelichting                                                                  |
| --------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------- | ---------------------------------------------------------------------------- |
| Sessies                                                                                                               | `claude-sonnet-5-5` | `low` of `medium` | Snel en natuurlijk; begin met `low` en verhoog als de diepgang tekortschiet. |
| Colleges                                                                                                              | `claude-sonnet-5-5` | `medium`          | Kwaliteit en samenhang wegen zwaarder dan snelheid.                          |
| Timeline-reacties, samenvattingen, moderatie-precheck, "Wie kan mij helpen?", gedachte van vandaag, dagvraag in stijl | `claude-haiku-5-5`  | `low`             | Kort, veel en goedkoop.                                                      |

- Laat ruimte in `max_tokens`: denken telt mee in de output.
- Is de latency in sessies te hoog, overweeg dan op Sonnet 5.5 `thinking: { type: "between_tools" }` (de laagste denkstand) en meet het effect op de kwaliteit.
- Indicatieve prijzen (oktober 2026, per miljoen tokens): Sonnet 5.5 $2 input / $10 output; Haiku 5.5 vanaf $0,10 input / $0,50 output. Zet ze in de prijstabel van de verbruiksteller en controleer ze op de [prijzenpagina](https://platform.claude.com/docs/en/about-claude/pricing).

### 8.8 Demomodus

- Per kerndenker: minstens 15 vooraf geschreven sessiefragmenten (opening, doorvragen, verdiepen, afronden, afscheid), 1 volledig voorbeeldcollege en minstens 10 timeline-reacties. Netwerkdenkers: een paar generieke fragmenten op basis van hun profiel.
- Selectie op eenvoudige trefwoorden; altijd het label "Demomodus".
- Doel: iedereen kan de site op GitHub Pages direct ervaren zonder key.

---

## 9. Design en UX

- **Sfeer:** "warm museum": rustig, hoogwaardig, papier, marmer, inkt. Elke denker heeft een eigen sfeer (kleuren, achtergrondmotief, displayletter) binnen één consistent systeem.
- **Thema's via CSS custom properties** per denker (bv. `[data-figure="socrates"] { --fig-primary: …; --fig-surface: …; }`); Tailwind-tokens verwijzen naar die variabelen. **Geen** dynamisch samengestelde classnames zoals `` `bg-${kleur}-500` ``: Tailwind genereert die niet.
- **Lettertypen** (self-hosted, open licentie), bijvoorbeeld Cormorant Garamond (klassiek), Cinzel (Romeins), EB Garamond (17e en 18e eeuw), IM Fell English (Franklin), Noto Serif SC (Chinees schrift), Noto Serif Devanagari en Noto Serif Gujarati (Gandhi), plus één goed leesbare broodletter. Laad per thema lazy; max. ~4 families tegelijk.
- **Avatars:** origineel ontworpen **SVG-medaillons** per denker (silhouet of monogram plus motief), met animaties per staat (luistert / denkt / spreekt). Respecteer `prefers-reduced-motion`. Optioneel publiek-domeinportretten (bv. via Wikimedia Commons), alléén als de status aantoonbaar publiek domein is, met bron en licentie in `CREDITS.md`. **Nooit** foto's van echte, hedendaagse mensen.
- **Microcopy** met karakter: "De deur van de stoa staat open", "Kant is precies op tijd", en als laadstate "Spinoza slijpt een lens …".
- **Toegankelijkheid:** volledige toetsenbordbediening, zichtbare focus, `aria-live="polite"` voor streamende berichten, AA-contrast ook binnen de thema's, schaalbare tekst. De timer kondigt zich voor schermlezers alleen aan bij 3 en bij 1 minuut.
- **Responsief** van 360 px tot desktop; leesbreedte max. ~70 tekens.
- **Leeg- en laadstates** overal ontworpen, in de toon van de app.

---

## 10. Datamodel (kern)

```ts
type Year = number; // v.Chr. negatief

interface Quote {
  text: string; // Nederlands
  original?: string;
  source: string; // werk + passage, bv. "Plato, Apologie 38a"
  status: 'authentiek' | 'parafrase' | 'toegeschreven';
  translation: 'eigen' | 'publiek-domein';
  verified: boolean;
}

type Relation =
  | 'leraar'
  | 'leerling'
  | 'invloed'
  | 'navolger'
  | 'tijdgenoot'
  | 'gesprekspartner'
  | 'correspondent'
  | 'vriend'
  | 'rivaal'
  | 'mentor'
  | 'criticus'
  | 'tegenpool'
  | 'andere school'
  | 'geestverwant'
  | 'commentator'
  | 'bewonderaar'
  | 'voorbeeld'
  | 'protegé';

interface Figure {
  id: string;
  tier: 'kern' | 'netwerk';
  name: string;
  nativeName?: string; // Σωκράτης, 老子
  born: Year;
  died: Year; // < 1950, gevalideerd
  approximate?: boolean;
  origin: string;
  school: string;
  tags: string[]; // thema's voor matching
  bio: string;
  keyConcepts: { term: string; native?: string; explanation: string }[];
  keyWorks: { title: string; year?: string; note?: string }[];
  lifeEvents: { year: string; text: string }[];
  quotes: Quote[];
  voice: {
    register: string;
    method: string;
    habits: string[];
    nativePhrases: { phrase: string; translation: string }[];
    avoid: string[];
  };
  modernLens: string;
  controversies: string[];
  theme: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
    motif: string;
    displayFont: string;
  };
  avatar: { kind: 'svg' | 'publiek-domein'; src?: string; credit?: string; license?: string };
  availability: { slots: string[] }; // 'HH:MM'
  network: { id: string; relation: Relation; note?: string }[]; // max. 10
}

interface Booking {
  id: string;
  figureId: string;
  date: string; // lokale datum
  time: string; // 'HH:MM'
  topicHint?: string;
  status: 'gepland' | 'actief' | 'afgerond' | 'gemist' | 'geannuleerd';
}

interface Message {
  id: string;
  role: 'user' | 'figure' | 'system';
  text: string;
  createdAt: string;
  outOfCharacter?: boolean;
}

interface Session {
  id: string;
  bookingId: string;
  figureId: string;
  startedAt: string;
  endsAt: string;
  extensions: number;
  compensatedMs: number;
  messages: Message[];
  summary?: string;
  reflectionQuestion?: string;
}

interface Lecture {
  id: string;
  figureId: string;
  topic: string;
  mainQuestion: string;
  plan?: { title: string; segments: { heading: string; keyPoints: string[] }[] };
  segments: {
    index: number;
    kind: 'opening' | 'deel' | 'antwoord' | 'conclusie';
    heading: string;
    text: string;
  }[];
  questions: { afterSegment: number; text: string }[]; // max. 3
  status: 'bezig' | 'afgerond';
  share: 'privé' | 'ingediend' | 'goedgekeurd' | 'afgekeurd';
  moderationNote?: string;
  isExample?: boolean;
  likedByMe: boolean;
  createdAt: string;
  completedAt?: string;
}

interface Post {
  id: string;
  text: string;
  tags: string[];
  createdAt: string;
  promptId?: string;
  reactions: {
    figureId: string;
    type: 'like' | 'comment';
    text?: string;
    visibleAt: string;
    seen: boolean;
  }[];
}

interface UserProfile {
  displayName: string;
  tier: 'basis' | 'premium';
  credits: number;
  follows: string[];
  discovered: string[];
  usageByDate: Record<string, { sessions: number; lectures: number }>;
}
```

---

## 11. Juridisch, ethisch en veiligheid

- **Rooster:** alleen personen die vóór 1950 zijn overleden, afgedwongen door de datavalidatie. Geen goden. Religieuze stichters: zie §14.
- **Auteursrecht:** de werken van deze denkers zijn publiek domein, moderne vertalingen meestal niet; daarom eigen vertalingen (§8.5). Voorbeeldcolleges en demoteksten zijn origineel werk.
- **Beeld:** geen afbeeldingen van levende personen; publiek-domeinbeelden alleen met bron en licentie in `CREDITS.md`.
- **Transparantie:** pagina _Over_ met een AI-disclaimer: AI-simulatie geïnspireerd op historische denkers, geen echte uitspraken, kan fouten bevatten, geen professioneel advies. Houd je ook aan de voorwaarden en het gebruiksbeleid van Anthropic.
- **Privacy:** in Fase 1 alles lokaal; korte privacyverklaring; de API-key gaat alleen naar Anthropic; geen analytics (later hooguit privacyvriendelijk en zonder cookies).
- **Leeftijd:** gericht op volwassenen; leg een minimumleeftijd vast in de voorwaarden (in Nederland is 16 de AVG-leeftijd voor eigen toestemming).
- **Crisisprotocol:** zie §8.4.
- **Vóór een commerciële lancering:** laat een jurist meekijken (naam en merk, voorwaarden, AVG, consumentenrecht, AI-regelgeving). Deze briefing is geen juridisch advies.

---

## 12. Valkuilen uit het prototype (niet herhalen)

Het eerdere prototype (één groot React-bestand uit een chat) liet de ervaring zien, maar had deze problemen:

1. **Componenten binnen componenten gedefinieerd** (`const TimelineTab = () => …` binnen de app-functie). Bij elke render worden ze opnieuw gemount: invoervelden verliezen na elke toetsaanslag hun focus en lokale state verdwijnt. → Alle componenten op moduleniveau.
2. **Dynamische Tailwind-classnames** (`` `bg-${color}-500` ``) → geen styling. → CSS-variabelen (§9).
3. **`window.claude.complete`** bestaat alleen in de Claude-chatomgeving. → AI-providerlaag (§5.3).
4. **Timer** als aftellende state met een interval dat elke seconde opnieuw werd aangemaakt, en een waarschuwing pas bij 1 minuut. → `endsAt`-tijdstempel, waarschuwing na 12 minuten.
5. **"Boek nu" startte direct een sessie**, los van het gekozen tijdslot. → echte reservering (§7.1).
6. **Stockfoto's van hedendaagse mensen** als portret van historische denkers. → SVG-medaillons of publiek-domeinbeelden.
7. **Verzonnen of onjuist toegeschreven citaten** in data en reacties. → citatenbeleid (§8.5).
8. **Een netwerk met personen die na 1950 overleden** (zoals Martin Luther King, Nelson Mandela en Nehru), met goden, en met verwijzingen naar denkers die niet in de data stonden. → rooster-regel en datavalidatie.
9. **Verzonnen gebruikersnamen en like-aantallen** als sociale bewijskracht. → gelabelde voorbeeldinhoud.
10. **Geen persistentie:** alles verdween bij herladen. → persist-stores (§5.4).
11. **Limieten alleen in de UI** (te omzeilen). Acceptabel in Fase 1, maar centraliseer de logica in één service, zodat Fase 2 haar serverside kan afdwingen.

---

## 13. Oplevering Fase 1: acceptatiecriteria

**Platform**

- [ ] De site draait op GitHub Pages via GitHub Actions; deeplinks werken na herladen.
- [ ] Zonder key werkt alles in demomodus, met duidelijke melding; met eigen key: gestreamde gesprekken in het Nederlands, in karakter.
- [ ] Alle data blijft na herladen bewaard; exporteren, importeren en wissen werken.

**Sessies**

- [ ] Boeken met bevestiging en .ics; 1 per dag (Premium 3); bezette slots consistent; annuleren geeft de dagplek terug.
- [ ] Starten binnen het venster; timer van 15:00 op basis van `endsAt`; waarschuwing na 12 minuten; afscheid na 15 minuten; +5 minuten met een credit (max. 2×); invoer daarna dicht.
- [ ] Samenvatting en reflectievraag in de afspraakgeschiedenis; het geheugen van de laatste 3 sessies werkt.

**Colleges**

- [ ] Aanvraag met onderwerp en één hoofdvraag; 1 per dag (Premium 3).
- [ ] Opbouw in delen; max. 3 vragen; conclusie met kernlessen en alleen echte werken bij _Verder lezen_.
- [ ] Onbeperkt terugkijken met hoofdstuknavigatie en afspeelmodus.
- [ ] Indienen → pre-check → moderatormodus → goedgekeurd in de bibliotheek, of afgekeurd met reden.

**Timeline en denkers**

- [ ] Berichten plaatsen; dagelijkse wisselende vraag zonder herhaling binnen 30 dagen.
- [ ] 0–3 likes en reacties van relevante denkers, met vertraging en melding; af en toe een nieuw ontdekte denker.
- [ ] Profielpagina per denker met specificaties, levenslijn, minstens 3 geverifieerde citaten (kerndenkers) en een netwerk van max. 10 met relatietype.

**Ontdekken en delen**

- [ ] Topcolleges, trending, aanbevolen, denker van de dag, "Wie kan mij helpen?", zoeken en filters.
- [ ] Citaatkaart uit college en sessie, met AI-label, te delen via Web Share of te downloaden.

**Kwaliteit**

- [ ] `validate:data` slaagt; unit-tests voor limieten, timer, boekingen, ranking, reactie-parsing en de crisisroute.
- [ ] Geen dynamische Tailwind-classnames, geen componenten binnen componenten, AI-tekst veilig gerenderd.
- [ ] AI-label zichtbaar bij elk gesprek, college en elke reactie.
- [ ] Lighthouse mobiel: Accessibility ≥ 95 en Performance ≥ 90 (streefwaarden).
- [ ] README (lokaal draaien, deploy, API-key, fasering), `CLAUDE.md` en `CREDITS.md` aanwezig.

---

## 14. Open beslispunten (met standaardkeuze)

| #   | Beslispunt                                                    | Standaard, tot de product owner anders beslist          |
| --- | ------------------------------------------------------------- | ------------------------------------------------------- |
| 1   | Naam en domein                                                | Werktitel "Filosofische Universiteit"; GitHub Pages-URL |
| 2   | Premium-limieten                                              | 3 sessies en 3 colleges per dag                         |
| 3   | Credits                                                       | Start met 2; 1 credit = +5 minuten; max. 2× per sessie  |
| 4   | Religieuze stichters (bv. Boeddha, Jezus) als gesprekspartner | Niet in Fase 1 (gevoelig); goden nooit                  |
| 5   | Spreekuren                                                    | 6–8 slots per denker per dag, tussen 09:00 en 21:00     |
| 6   | Reactievertraging op de timeline                              | 1–20 minuten                                            |
| 7   | Backend Fase 2                                                | Supabase                                                |
| 8   | Betaalprovider Fase 3                                         | Mollie of Stripe                                        |
| 9   | Zichtbaarheid timeline in Fase 2                              | Standaard privé; per bericht openbaar, met moderatie    |

---

## 15. Roadmap (Fase 4)

- **Rooster uitbreiden richting 100 denkers**, onder meer met de rest van de eerdere top 20 (een deel staat al als netwerkdenker in de data en kan promoveren tot kerndenker): Confucius, Cleopatra VII, Leonardo da Vinci, Machiavelli, Voltaire, Charles Darwin, Karl Marx, Friedrich Nietzsche, Ralph Waldo Emerson, Marie Curie, Sigmund Freud, Max Weber, Nikola Tesla en Virginia Woolf.
- **Sociologen die de samenleving van nu duiden** en hun theorie uitleggen aan de hand van actuele voorbeelden: Émile Durkheim, Max Weber, Georg Simmel, Alexis de Tocqueville, Harriet Martineau, Thorstein Veblen, Ferdinand Tönnies, Jane Addams, George Herbert Mead en Karl Marx.
- **Suggestie, meer vrouwelijke denkers:** Hypatia, Hildegard von Bingen, Christine de Pizan, Anna Maria van Schurman, Mary Wollstonecraft, Aletta Jacobs, Simone Weil, Edith Stein en Rosa Luxemburg.
- **Suggesties, functies:** voorlezen (TTS), een installeerbare app (PWA) met meldingen, een Engelstalige versie.

---

## 16. Werkafspraken

- **Taal:** communicatie met de product owner in het Nederlands.
- **Vraagformat:** vragen genummerd (1, 2, 3 …), max. 10 per keer, met een witregel vóór elke vraag. Per vraag minstens 5 en max. 10 antwoordsuggesties als a, b, c …, elk voorafgegaan door een witregel. Is er een duidelijke standaardkeuze, vraag dan niet maar meld wat je kiest.
- **Werkwijze:** kleine, werkende stappen; commit per mijlpaal met een duidelijke boodschap. Na elke mijlpaal 3–5 regels status: wat werkt, wat nog niet, wat je nodig hebt.
- **Volgorde (suggestie):** fundament (stack, deploy, thema's, opslag, klok, providerlaag met demomodus) → denkersdata en validatie → profielen → sessies → colleges → timeline → ontdekken → moderatie en delen → afwerking en toegankelijkheid. Deploy vanaf de eerste mijlpaal, zodat de product owner steeds kan meekijken.
- **Feiten:** bij twijfel over een citaat, jaartal of relatie: opzoeken of weglaten.
