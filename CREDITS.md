# Credits en licenties

## Beeld

- **Geen foto's of portretten.** De medaillons van de denkers zijn originele SVG-ontwerpen
  (monogram + motief in het thema van de denker), gemaakt voor dit project.
- Het logo, de iconen en de social-preview (`public/`) zijn origineel en worden gegenereerd met
  `npm run gen:assets`.
- Worden er later publiek-domeinbeelden toegevoegd, dan komt hier per beeld: titel, maker, bron-URL
  en licentie.

## Teksten

- **Citaten** zijn eigen Nederlandse vertalingen van publiek-domeinteksten. Per citaat staan het
  werk en de vindplaats in de denkersdata (`src/data/figures/**`). Wat niet is geverifieerd, staat
  er niet in of heet expliciet _parafrase_.
- **Demoteksten, voorbeeldcolleges en dagvragen** zijn origineel werk voor dit project.
- Alle gesprekken, colleges en reacties in de app zijn een **AI-simulatie**, geïnspireerd op
  historische denkers. Het zijn geen echte uitspraken.

## Lettertypen (SIL Open Font License 1.1, self-hosted via Fontsource)

| Lettertype                            | Ontwerp                      | Gebruik                              |
| ------------------------------------- | ---------------------------- | ------------------------------------ |
| Literata                              | TypeTogether (voor Google)   | broodtekst                           |
| Cormorant Garamond                    | Christian Thalmann           | koppen en logo                       |
| Cinzel                                | Natanael Gama                | displayletter in sommige thema's     |
| EB Garamond                           | Georg Duffner, Octavio Pardo | displayletter, Grieks schrift        |
| IM Fell English                       | Igino Marini                 | displayletter in sommige thema's     |
| Noto Serif SC / Devanagari / Gujarati | Google (Noto-project)        | namen in het oorspronkelijke schrift |

Licentie: <https://openfontlicense.org> · Fontsource: <https://fontsource.org>

## Software (open source)

| Pakket                                                                                              | Licentie |
| --------------------------------------------------------------------------------------------------- | -------- |
| React, React DOM                                                                                    | MIT      |
| React Router                                                                                        | MIT      |
| Zustand                                                                                             | MIT      |
| Zod                                                                                                 | MIT      |
| Anthropic TypeScript SDK                                                                            | MIT      |
| Tailwind CSS                                                                                        | MIT      |
| Vite                                                                                                | MIT      |
| Lucide (iconen)                                                                                     | ISC      |
| ElevenLabs JavaScript SDK (`@elevenlabs/client`), met de audio-worklets (μ-law-code uit `wavefile`) | MIT      |

De volledige lijst met versies staat in `package.json` / `package-lock.json`. De WebRTC-bibliotheek
`livekit-client` (Apache-2.0) is een afhankelijkheid van de ElevenLabs-SDK, maar wordt niet
meegeleverd: Oudiency belt via WebSocket en vervangt hem in de build door een lege module. De
resampler voor de microfoon is eigen code (`src/voice/resampler.ts`).
