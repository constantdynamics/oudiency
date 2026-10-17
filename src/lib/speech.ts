/**
 * Voorlezen met de stem van de browser (Web Speech API): gratis, zonder netwerk en zonder
 * sleutel. Gebruikt voor "Antwoorden voorlezen" (instelling) en "Voorlezen" bij colleges.
 */

export function canSpeak(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Een Nederlandse stem als die er is (de browser kiest anders zelf). */
function dutchVoice(): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices();
  return voices.find((v) => v.lang === 'nl-NL') ?? voices.find((v) => v.lang.startsWith('nl'));
}

/** Lees een tekst voor; een lopende voorlezing stopt eerst. */
export function speak(text: string, onEnd?: () => void): void {
  if (!canSpeak() || !text.trim()) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'nl-NL';
  const voice = dutchVoice();
  if (voice) utterance.voice = voice;
  utterance.rate = 0.98;
  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if (canSpeak()) window.speechSynthesis.cancel();
}
