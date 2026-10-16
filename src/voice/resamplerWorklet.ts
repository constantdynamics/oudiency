/**
 * AudioWorklet-module met dezelfde vorm als `libsamplerate-js`, die de ElevenLabs-SDK verwacht:
 * `globalThis.LibSampleRate.create(kanalen, van, naar)` → `{ full(stukje) }`. De SDK laadt deze
 * module (via `libsampleratePath`) vóór zijn eigen microfoon-worklet.
 */
import { createResampler } from './resampler';

const scope = globalThis as typeof globalThis & {
  LibSampleRate?: {
    create(
      channels: number,
      inputRate: number,
      outputRate: number,
    ): Promise<{ full(data: Float32Array): Float32Array; destroy(): void }>;
  };
};

scope.LibSampleRate = {
  create(_channels, inputRate, outputRate) {
    const resampler = createResampler(inputRate, outputRate);
    return Promise.resolve({
      full: (data: Float32Array) => resampler.process(data),
      destroy: () => undefined,
    });
  },
};
