# Oudiency — projectregels voor Claude

Webapp (GitHub Pages) waarin je in gesprek gaat met grote denkers uit de geschiedenis: sessies op
afspraak, colleges, een eigen timeline en een denkersnetwerk. Alles is een **AI-simulatie**.
Volledige opdracht: `BRIEFING.md`. **Communiceer met de product owner in het Nederlands**; vragen
genummerd (max. 10), per vraag ≥ 5 suggesties als a, b, c … (witregel vóór elke vraag en suggestie).

## Stack

Vite 8 + React 19 + TypeScript (strict) · Tailwind 4 (`@theme`-tokens + CSS-variabelen per denker) ·
React Router (`HashRouter`, declaratief, pagina's via `React.lazy`) · Zustand persist + Zod
(`zod/mini` in de opslag, klassiek `zod` alleen in lazy AI-code) · `@anthropic-ai/sdk` (BYOK, lazy
geladen) · lucide-react · @fontsource · Vitest + Testing Library · ESLint + Prettier · Node 24.

## Commando's

```bash
npm run dev            # lokaal (http://localhost:5173, dev-paneel met ?dev=1)
npm run lint           # ESLint
npm run format:check   # Prettier (npm run format om te herstellen)
npm run typecheck      # tsc -b
npm test               # Vitest
npm run validate:data  # rooster- en netwerkregels (§6.4), ook in CI
npm run gen:figures    # na élke wijziging in src/data/figures/** (index.generated.ts)
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
- Alle UI-teksten in `src/i18n/nl.ts`; config in `src/config/` (app, limits, models).
- AI-tekst alleen via `RichText` (beperkte, veilige markdown); nooit `dangerouslySetInnerHTML`.
- Logica met tests in `src/lib`, `src/services`, `src/ai/prompts`; UI dun houden.
- Denkers: één bestand per denker in `src/data/figures/{core,network}/`, export-naam = id; daarna
  `npm run gen:figures`. Volledige profielen laden lazy (eigen chunk per denker).
- Houd de startbundel klein (Lighthouse mobiel ≥ 90): zware dingen (`@anthropic-ai/sdk`, klassiek
  `zod`, extra fonts, pagina's) alleen via dynamische imports.
- Modellen per taak: `src/config/models.ts`. Zet nooit het model-ID van de bouwende sessie in
  commits, PR's of code.

## Werkwijze

Kleine werkende stappen, commit per mijlpaal met 3–5 regels status. Werk op de toegewezen
`claude/*`-branch; push of merge niet naar een andere branch zonder toestemming van de product
owner.
