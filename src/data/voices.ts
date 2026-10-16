/**
 * Stemmen van de kerndenkers (bellen, §spraak). Elke kerndenker krijgt een eigen ontworpen stem
 * (ElevenLabs Voice Design) met een licht accent van herkomst. Nooit een kloon van echte
 * opnames, ook niet van wie die bestaan: het is een stem in de geest van de denker.
 *
 * - `design`: beschrijving voor Voice Design (Engels werkt daar het best; wordt niet uitgesproken).
 * - `sample`: proeftekst voor de drie stemvoorbeelden (Nederlands, 100–1000 tekens).
 * - `greeting`: begroeting na de vaste AI-melding, in eigen stijl.
 * Geen citaten in deze teksten: alleen eigen woorden (gecontroleerd door validate:data).
 */
export interface VoiceSpec {
  design: string;
  sample: string;
  greeting: string;
  /** Spreektempo (0,7–1,2; 1 = normaal). */
  speed: number;
  /** Stabiliteit (0–1): lager is expressiever, hoger is rustiger en gelijkmatiger. */
  stability: number;
}

export const CORE_VOICES: Readonly<Record<string, VoiceSpec>> = {
  socrates: {
    design:
      'A man of about seventy from ancient Athens. Warm, slightly raspy and lively voice with a playful, gently ironic tone and a smile in it. Unhurried, conversational pace with natural pauses, as if strolling through a marketplace. Speaks fluent Dutch with a light Greek accent.',
    sample:
      'Wees gegroet, vriend. Ik ben een AI-simulatie van Socrates, uit het oude Athene. Vertel eens: wat weet je eigenlijk zeker? En hoe weet je dat? Kom, laten we het samen onderzoeken, zonder haast en zonder schaamte voor wat we nog niet weten.',
    greeting:
      'Wees gegroet, vriend! Kom, loop een eindje met me mee. Waar denk je de laatste tijd over na?',
    speed: 1,
    stability: 0.45,
  },
  aurelius: {
    design:
      'A man in his late fifties, a Roman emperor and Stoic philosopher. Calm, deep, measured and slightly weary voice; dignified yet humble and introspective, never pompous. Steady, deliberate pace. Speaks fluent Dutch with a light Italian accent.',
    sample:
      'Welkom. Ik ben een AI-simulatie van Marcus Aurelius, keizer van Rome en leerling van de Stoa. Ik schreef aantekeningen voor mezelf, om mijn hoofd helder te houden. Laten we samen kijken naar wat in jouw macht ligt, en wat niet.',
    greeting:
      'Welkom. Ga zitten; de dag is kort, dus laten we haar goed gebruiken. Wat houdt je bezig?',
    speed: 0.95,
    stability: 0.6,
  },
  laozi: {
    design:
      'A very old man with a soft, gentle and airy voice; serene, quiet and kind, with a hint of humor. Slow pace with calm, peaceful pauses. Speaks fluent Dutch with a light Chinese accent.',
    sample:
      'Welkom, reiziger. Ik ben een AI-simulatie van Laozi. Men zegt dat ik bij een grenspas een klein boek achterliet over de weg. Ga zitten. Kijk naar het water: het is zacht, en toch slijt het de steen.',
    greeting: 'Welkom, reiziger. Er is geen haast. Waar wil je over praten?',
    speed: 0.88,
    stability: 0.6,
  },
  spinoza: {
    design:
      'A man in his early forties from seventeenth-century Amsterdam. Quiet, clear, precise and gentle voice; calm, rational and warmly patient. Even, thoughtful pace. Speaks Amsterdam Dutch with a faint Portuguese tinge.',
    sample:
      'Goedendag. Ik ben een AI-simulatie van Spinoza, lenzenslijper uit Amsterdam. Ik probeer de dingen te begrijpen zoals ze zijn, ook onze gevoelens en hartstochten. Kom, laten we rustig kijken naar wat jou vandaag bezighoudt.',
    greeting: 'Welkom. Neem plaats, en vertel rustig: wat wil je vandaag beter begrijpen?',
    speed: 0.97,
    stability: 0.6,
  },
  kant: {
    design:
      'An elderly man of about eighty from Königsberg in Prussia. Precise, articulate, slightly high and dry voice; courteous, formal and orderly, with occasional dry wit. Measured, punctual rhythm. Speaks fluent Dutch with a light German accent.',
    sample:
      'Goedendag. Ik ben een AI-simulatie van Immanuel Kant, uit Königsberg. U bent precies op tijd, dat waardeer ik. Laten we vandaag zorgvuldig nadenken: wat kunt u weten, wat moet u doen, en wat mag u hopen?',
    greeting:
      'Goedendag, u bent precies op tijd. Welke vraag wilt u vandaag zorgvuldig onderzoeken?',
    speed: 0.97,
    stability: 0.65,
  },
  rousseau: {
    design:
      'A man in his sixties from Geneva. Passionate, warm and emotional voice, sometimes melancholic, sometimes fiery; expressive and personal. Lively, varied pace. Speaks fluent Dutch with a light French accent.',
    sample:
      'Ah, welkom! Ik ben een AI-simulatie van Jean-Jacques Rousseau, uit Genève. Ik wandel het liefst alleen door de natuur; daar denk ik het helderst. Vertel me eerlijk wat je voelt, niet wat je denkt dat je hoort te voelen.',
    greeting:
      'Ah, welkom! Kom, we lopen even naar buiten, daar praat het vrijer. Wat ligt er op je hart?',
    speed: 1,
    stability: 0.4,
  },
  franklin: {
    design:
      'An elderly American gentleman in his late seventies. Genial, witty, warm and folksy voice with a twinkle of humor; practical and confident. Relaxed, chatty pace. Speaks fluent Dutch with a light American English accent.',
    sample:
      'Goedendag! Ik ben een AI-simulatie van Benjamin Franklin: drukker, schrijver, uitvinder en diplomaat. Geboren in Boston, maar Philadelphia werd mijn thuis. Ik hou van praktische vragen en eerlijke proeven. Zullen we kijken wat jij deze week anders kunt doen?',
    greeting:
      'Welkom, vriend! Ik ben benieuwd: aan welk vraagstuk zullen we vandaag samen sleutelen?',
    speed: 1,
    stability: 0.5,
  },
  gandhi: {
    design:
      'An elderly man in his late seventies from Gujarat, India. Soft, gentle, light and calm voice; kind, patient and quietly determined, with occasional gentle humor. Slow, deliberate pace. Speaks fluent Dutch with a light Indian accent.',
    sample:
      'Welkom, mijn vriend. Ik ben een AI-simulatie van Gandhi. Ik geloof in waarheid en geweldloosheid, in kleine stappen en een eenvoudig leven. Ga zitten, dan praten we rustig over wat jou bezighoudt.',
    greeting: 'Welkom, mijn vriend. Ga zitten. Waar wil je vandaag samen over nadenken?',
    speed: 0.92,
    stability: 0.6,
  },
};

export function voiceSpecFor(figureId: string): VoiceSpec | undefined {
  return CORE_VOICES[figureId];
}
