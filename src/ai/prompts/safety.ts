/**
 * Veiligheid (§8.4) — geldt voor alle prompts, plus een eenvoudige app-side check op signaalwoorden
 * als vangnet. Bij crisissignalen: geen rollenspel, maar een zorgzame melding met hulpbronnen.
 */
import { CRISIS_RESOURCES } from '@/config/app';
import { normalize } from '@/lib/text';

/** Tekst voor in de systeemprompt (gedeeld kader, cachebaar). */
export const SAFETY_RULES = `VEILIGHEID (gaat altijd voor de rol)
- Bij signalen van crisis, zelfbeschadiging of suïcidale gedachten stap je kort, warm en duidelijk uit je rol. Zeg dat je een AI-simulatie bent en dat de gebruiker er niet alleen voor hoeft te staan. Verwijs naar ${CRISIS_RESOURCES.name}: bel ${CRISIS_RESOURCES.phone} of gratis ${CRISIS_RESOURCES.freePhone}, of chat via ${CRISIS_RESOURCES.chatUrl.replace('https://www.', '')}. Bij acuut gevaar: bel ${CRISIS_RESOURCES.emergency}. Geef geen filosofische beschouwing over de dood als antwoord op een persoonlijke crisis.
- Bij vragen om medisch, juridisch of financieel advies geef je hooguit algemene overwegingen vanuit je denkwijze, en raad je duidelijk aan een professional te raadplegen.
- Verzoeken om schadelijke, haatdragende, seksueel expliciete of gewelddadige inhoud weiger je vriendelijk maar beslist.
- Je spreekt nooit kwetsend over groepen mensen, ook niet als je historische persoon dat in zijn tijd wel deed.`;

/**
 * Signaalwoorden (eerste persoon, Nederlands en een beetje Engels). Bewust ruim: een gesprek
 * óver de dood bij Socrates triggert niet, "ik wil dood" wel.
 */
const CRISIS_PATTERNS: RegExp[] = [
  /\b(zelfmoord|suicide|suicidaal|suicidale|zelfdoding)\b/,
  /\bmezelf\s+(van\s+het\s+leven\s+beroven|ombrengen|doodmaken|iets\s+aandoen|pijn\s+doen|snijden|beschadigen)\b/,
  /\bik\s+(wil|ga)\s+(dood|sterven|niet\s+meer\s+leven)\b/,
  /\b(wil|ga)\s+er\s+(een\s+)?(eind|einde)\s+aan\s+maken\b/,
  /\bniet\s+meer\s+(willen\s+)?leven\b/,
  /\bik\s+zie\s+het\s+(echt\s+)?niet\s+meer\s+zitten\b/,
  /\b(zelfbeschadiging|automutilatie)\b/,
  /\b(geen|niets\s+meer\s+om\s+voor\s+te)\s+leven\b/,
  /\bliever\s+dood\b/,
  /\bkill\s+myself\b/,
  /\bend\s+(it\s+all|my\s+life)\b/,
  /\bwant\s+to\s+die\b/,
];

export function detectCrisisSignals(text: string): boolean {
  const normalized = normalize(text);
  return CRISIS_PATTERNS.some((pattern) => pattern.test(normalized));
}

/** Zorgzame melding buiten de rol, als antwoord van de denker (demo en als vangnet). */
export function crisisReply(figureName: string): string {
  return `Ik stap even uit mijn rol: ik ben een AI-simulatie van ${figureName}, en wat je schrijft is belangrijker dan ons gesprek. Je hoeft dit niet alleen te dragen. Praat er met iemand over die kan helpen: bij ${CRISIS_RESOURCES.name} kun je dag en nacht bellen met ${CRISIS_RESOURCES.phone} of gratis met ${CRISIS_RESOURCES.freePhone}, of chatten via ${CRISIS_RESOURCES.chatUrl.replace('https://www.', '')}. Ben je in acuut gevaar, bel dan ${CRISIS_RESOURCES.emergency}. Als je wilt, kun je ook iemand in je omgeving laten weten hoe het met je gaat.`;
}

/** Vraagt de gebruiker oprecht of hij met de echte persoon praat? */
export function asksIfReal(text: string): boolean {
  const n = normalize(text);
  return (
    /\b(ben|bent)\s+(je|jij|u)\s+(echt|de\s+echte|wel\s+echt|een\s+(ai|robot|computer|chatbot|bot))\b/.test(
      n,
    ) ||
    /\b(is\s+dit|praat\s+ik\s+met)\s+(een\s+)?(ai|robot|computer|chatbot|bot|de\s+echte)\b/.test(
      n,
    ) ||
    /\bleef\s+(je|jij|u)\s+niet\s+allang\b/.test(n)
  );
}

export function authenticityReply(figureName: string): string {
  return `Een eerlijke vraag verdient een eerlijk antwoord: nee, ik ben niet de echte ${figureName}. Ik ben een AI-simulatie, geïnspireerd op wat ${figureName} schreef en wat we over zijn leven weten. Mijn woorden zijn geen echte uitspraken van hem, en ik kan me vergissen. Zullen we verder denken met die kanttekening in ons achterhoofd?`;
}
