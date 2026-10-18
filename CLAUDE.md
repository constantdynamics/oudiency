# Oudiency — projectregels voor Claude

Webapp (GitHub Pages) waarin je in gesprek gaat met grote denkers uit de geschiedenis: sessies op
afspraak, colleges, een eigen timeline en een denkersnetwerk. Alles is een **AI-simulatie**.
Volledige opdracht: `BRIEFING.md`. **Communiceer met de product owner in het Nederlands**; vragen
genummerd (max. 10), per vraag ≥ 5 suggesties als a, b, c … (witregel vóór elke vraag en suggestie).

## Stack

Vite 8 + React 19 + TypeScript (strict) · Tailwind 4 (`@theme`-tokens + CSS-variabelen per denker) ·
React Router (`HashRouter`, declaratief; routes in `src/app/routes.tsx`, pagina's via `lazyPage`) ·
Zustand persist + Zod (`zod/mini` in de opslag, klassiek `zod` alleen in lazy AI-code) ·
`@anthropic-ai/sdk` (BYOK, lazy geladen) · lucide-react · @fontsource · Vitest + Testing Library ·
ESLint + Prettier · Node 24.

## Commando's

```bash
npm run dev            # lokaal (http://localhost:5173, dev-paneel met ?dev=1)
npm run lint           # ESLint
npm run format:check   # Prettier (npm run format om te herstellen)
npm run typecheck      # tsc -b
npm test               # Vitest
npm run validate:data  # rooster- en netwerkregels (§6.4), ook in CI
npm run gen:index      # na élke wijziging in denkers of voorbeeldcolleges (index.generated.ts)
npm run gen:assets     # favicon/iconen/og-image opnieuw (vereist Playwright)
npm run build          # typecheck + productiebuild (CSP-meta wordt ingevoegd)
```

Deploy: `.github/workflows/deploy.yml` controleert elke push; alleen de standaardbranch gaat naar
GitHub Pages.

## Niet onderhandelbaar (§2)

1. UI en content in het **Nederlands**.
2. Alleen personen die **vóór 1950 overleden**; geen goden, geen auteursrechtelijk beschermde
   fictieve personages, geen religieuze stichters in Fase 1. `validate:data` dwingt dit af.
3. Elk gesprek, college en elke reactie is **zichtbaar gelabeld als AI-simulatie**
   (`APP.aiLabel`, ook op gedeelde citaatkaarten).
4. **Geen verzonnen citaten:** alleen geverifieerde citaten met bron (eigen vertaling), anders
   expliciet als parafrase. "Verder lezen" alleen uit `keyWorks`.
5. Historische persoonlijkheid **met moderne kennis** (weet dat het een simulatie is, mag naar nu
   verwijzen).
6. **Volledig statisch** op GitHub Pages; geen secrets in de code (`VITE_*` is publiek). De API-key
   staat alleen in localStorage, gaat alleen naar `api.anthropic.com` en nooit mee in een export.
7. **Privacy by design:** in Fase 1 alles lokaal, geen tracking/analytics, fonts en assets
   self-hosted.
8. **Mobile-first, WCAG 2.2 AA** (contrast, focus, toetsenbord, `prefers-reduced-motion`).
9. **Feiten:** bij twijfel over een citaat, jaartal of relatie: opzoeken of weglaten.
10. **Crisissignalen** → hulpkaart (113 / 0800-0113 / 113.nl, 112), geen rollenspel; ook in de
    demomodus (`src/ai/prompts/safety.ts`, getest).

## Valkuilen die we niet herhalen (§12)

- **Componenten altijd op moduleniveau**, nooit binnen een andere component (lint:
  `@eslint-react/no-nested-component-definitions`).
- **Geen dynamische Tailwind-classnames** (`` `bg-${x}-500` ``): gebruik de thema-variabelen
  (`bg-fig`, `text-fig-accent`, …) of vaste classnames per variant.
- Nooit `window.claude.complete`: alles via de providerlaag (`src/ai`: demo / anthropic-browser /
  proxy-stub).
- **Timers rekenen vanaf `endsAt`**, nooit aftellende state; waarschuwing na 12 minuten.
- **"Boek nu" maakt een reservering**, start nooit direct een sessie.
- Geen stockfoto's: SVG-medaillons (`Avatar`) of publiek-domeinbeelden met bron in `CREDITS.md`.
- Geen verzonnen gebruikersnamen of like-aantallen; voorbeeldinhoud heet "Voorbeeld".
- Alles persistent (persist-stores met schemaversie en migraties).
- **Limieten alleen via `src/services/limits.service.ts`** (Fase 2 dwingt dezelfde regels af op de
  server).

## Conventies

- Tijd altijd via `clock` (`src/lib/clock.ts`), nooit `Date.now()` in domeinlogica (lint).
- Alle UI-teksten in `src/i18n/` (`nl.ts`; `voice.ts` voor bellen, laadt lazy); config in
  `src/config/` (app, limits, models, voice).
- AI-tekst alleen via `RichText` (beperkte, veilige markdown); nooit `dangerouslySetInnerHTML`.
- Logica met tests in `src/lib`, `src/services`, `src/ai/prompts`; UI dun houden.
- Denkers: één bestand per denker in `src/data/figures/{core,network}/`, export-naam = id; daarna
  `npm run gen:index`. Volledige profielen laden lazy (eigen chunk per denker).
- Houd de startbundel klein (Lighthouse mobiel ≥ 90): zware dingen (`@anthropic-ai/sdk`, klassiek
  `zod`, extra fonts, pagina's) alleen via dynamische imports. Een nieuwe pagina gaat via
  `lazyPage` in `routes.tsx` (deeplinks halen hun chunk vooraf op); displayletters laden pas na
  de eerste paint (`src/lib/fonts.ts`).
- Modellen per taak: `src/config/models.ts`. Zet nooit het model-ID van de bouwende sessie in
  commits, PR's of code.

## Bellen (spraak)

- ElevenLabs Agents met Claude (`claude-sonnet-5-5`) als brein. Eén agent per account; rol, stem en
  openingszin per gesprek als override (`src/voice`, `src/ai/prompts/voice.ts`). Wijzig je
  `agentPayload`, verhoog dan `VOICE.agentConfigVersion`: de app werkt de agent zelf bij.
- ElevenLabs-sleutel = `elevenLabsKeyStorage`: alleen localStorage, alleen naar `api.elevenlabs.io`,
  nooit in een export. Privacy van de agent blijft `record_voice: false`, bewaartermijn 0.
- CSP blijft strikt: audio-worklets via `?url&no-inline` (nooit `data:`), de resampler via
  `?worker&url`. `livekit-client` is in `vite.config.ts` vervangen door een stub: bellen gaat via
  WebSocket (gesprekslink); kies nooit WebRTC zonder die alias weg te halen.
- `CallSession` (los van React, getest) rekent vanaf `endsAt`, stuurt tijdsignalen bij 3 en 1
  minuut, vraagt om het afscheid en stopt direct bij een crisissignaal.
- Stemmen per kerndenker in `src/data/voices.ts` (geen citaten; `validate:data` controleert ze).

## Podcasts

- Alleen met eigen sleutels (geen demomodus): Claude schrijft het script (`src/ai/prompts/podcast.ts`,
  structured output), ElevenLabs leest voor (één MP3 per fragment). Logica in
  `src/podcast` en `src/services/podcast.service.ts` (getest), UI in `src/features/podcasts`.
- **Sophie** (`src/data/podcastHost.ts`) is de AI-presentator en zegt in het eerste fragment dat het
  een AI-simulatie is; ontbreekt dat, dan zet `toSegments` `FIXED_INTRO` vooraan. Geen aflevering
  zonder die melding.
- De aflevering van vandaag schrijft bij het openen van de app (achtergrondtaak in `daily.ts`); de
  stemmen pas bij afspelen. Audio staat in IndexedDB (`audioCache.ts`), nooit in een export; CSP
  heeft daarvoor `media-src blob:`.
- De speler (`player.ts`) laadt lazy; in de startbundel zitten alleen `playerState.ts`, de
  `MiniPlayer` en kleine hulpjes. De miniplayer zet `--player-h`: alles wat onderaan vastzit
  (composer, toasts) rekent die hoogte mee. Acties altijd via `withPlayer` (geeft audio vrij in de
  tik). Bellen pauzeert de podcast (`pausePodcast`).
- Luistervragen en inbellen: het antwoord komt direct na het fragment dat speelt
  (`listenerQuestion.ts`). Eén denker → je belt die denker, een gesprek → je belt Sophie, die de
  vraag doorgeeft (`podcastCall.ts`, zelfde agent als bellen). Crisissignalen geven de hulpkaart,
  nooit een luistervraag.
- De denkers kennen je eerdere sessies en recente timelineberichten (`memory.ts`).
- Stemmodel: standaard `eleven_flash_v2_5`; na het vergelijken op de Podcasts-pagina kies je Eleven
  v4 (Turbo) (`TTS_MODELS` in `config/podcast.ts`). Alleen v4 krijgt emotie-aanwijzingen (hooguit
  één Engelse tag per fragment, `audioTags.ts`); in het transcript zijn ze onzichtbaar.
- "Andere stem" (`voiceChoice.ts`) bewaart per spreker een gekozen stem (`overrides` in de
  voicestore); die gaat overal voor (podcast, inbellen, bellen) en geldt meteen.

## Onderzoek op aanvraag

- Alleen met je eigen Claude-sleutel (geen demomodus). Daglimiet 1 (Premium 3) via
  `limits.service` (`research`); een extra vorm uit hetzelfde onderzoek telt niet mee, en een college
  uit een onderzoek telt niet voor de collegelimiet.
- Keten in `src/research` (getest): Haiku maakt Engelse zoektermen (`researchPlan`; een ongeschikte
  vraag geeft de dagplek terug), `wiki.ts` leest en.wikipedia/en.wikisource anoniem (`origin=*`, CSP
  `connect-src`), `passages.ts` kiest de stukken, Sonnet schrijft de notitie (`research`).
- **Citaten:** alleen wat `isVerbatim` letterlijk terugvindt in het Wikisource-fragment dat Claude
  zag; nooit uit Wikipedia of uit het geheugen. Bronteksten worden niet bewaard (alleen titel en url).
- De notitie is onzichtbaar voor de gebruiker (keuze 7c) en gaat via `researchBlock` mee naar elke
  vorm: essay (`researchText`, leestips alleen uit `keyWorks`), podcast (`researchId` op de
  aflevering; een gesprek kan met drie), college (`guestIds`: gastdocenten geven deel 2 en 3, elk in
  eigen persona; `segment.figureId`) en bellen (tien minuten, ook met een kant-en-klare stem).
- Wikisource-HTML gaat pas na `withoutInlineStyles` door DOMParser (ook daar geldt de CSP).

## Werkwijze

Kleine werkende stappen, commit per mijlpaal met 3–5 regels status. Werk op de toegewezen
`claude/*`-branch; push of merge niet naar een andere branch zonder toestemming van de product
owner.
