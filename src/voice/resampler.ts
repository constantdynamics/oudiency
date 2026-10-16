/**
 * Kleine streaming-resampler voor de microfoon (bijvoorbeeld 48 kHz → 16 kHz). Alleen nodig in
 * browsers die de microfoon niet zelf op 16 kHz kunnen leveren (zoals Firefox). Vervangt de
 * resampler die de ElevenLabs-SDK anders van een CDN laadt (1,4 MB): zo blijft alles op de
 * eigen site en blijft de CSP strikt.
 *
 * Methode: bandbegrensde interpolatie met een windowed-sinc-kernel (Blackman). Bij verlagen van
 * de samplefrequentie schuift de afsnijfrequentie mee, zodat er geen aliasing ontstaat. De
 * toestand loopt over de stukjes heen door, dus er ontstaan geen klikjes op de grenzen.
 */

export interface Resampler {
  /** Verwerkt het volgende stukje en geeft de beschikbare uitvoer terug. */
  process(input: Float32Array): Float32Array;
}

function sinc(x: number): number {
  if (x === 0) return 1;
  const px = Math.PI * x;
  return Math.sin(px) / px;
}

function blackman(x: number, halfWidth: number): number {
  // x in [-halfWidth, halfWidth] → venster in [0, 1]
  const n = (x + halfWidth) / (2 * halfWidth);
  return 0.42 - 0.5 * Math.cos(2 * Math.PI * n) + 0.08 * Math.cos(4 * Math.PI * n);
}

export function createResampler(inputRate: number, outputRate: number, halfWidth = 16): Resampler {
  if (!(inputRate > 0 && outputRate > 0)) throw new Error('Ongeldige samplefrequentie');
  const step = inputRate / outputRate;
  // Afsnijden net onder het nieuwe Nyquist-punt (alleen bij verlagen).
  const cutoff = Math.min(1, outputRate / inputRate) * 0.92;
  let history = new Float32Array(0);
  /** Positie (in invoersamples, t.o.v. het begin van `history`) van het volgende uitvoersample. */
  let position = 0;

  const kernel = (t: number) =>
    Math.abs(t) >= halfWidth ? 0 : cutoff * sinc(cutoff * t) * blackman(t, halfWidth);

  return {
    process(input) {
      const data = new Float32Array(history.length + input.length);
      data.set(history);
      data.set(input, history.length);
      const output: number[] = [];
      while (position + halfWidth < data.length) {
        const center = Math.floor(position);
        let sum = 0;
        for (let i = center - halfWidth + 1; i <= center + halfWidth; i++) {
          if (i < 0) continue;
          sum += (data[i] ?? 0) * kernel(position - i);
        }
        output.push(sum);
        position += step;
      }
      const keepFrom = Math.max(0, Math.floor(position) - halfWidth);
      history = data.slice(keepFrom);
      position -= keepFrom;
      return Float32Array.from(output);
    },
  };
}
