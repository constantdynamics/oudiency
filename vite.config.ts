import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

/**
 * Content-Security-Policy voor de productiebuild. GitHub Pages ondersteunt geen eigen
 * headers, dus de CSP gaat als <meta http-equiv> in index.html. In dev laten we hem weg,
 * omdat HMR inline scripts gebruikt.
 *
 * - connect-src: Anthropic (eigen key), ElevenLabs (bellen: REST en de gespreks-WebSocket) en
 *   de Engelstalige Wikipedia en Wikisource (onderzoek op aanvraag).
 * - media-src data: voor de stemvoorbeelden, blob: voor de podcastfragmenten (op het apparaat
 *   bewaard); de audio-worklets en resampler komen van 'self'.
 *
 * Fase 2: voeg het Supabase-domein toe aan connect-src.
 */
export const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.anthropic.com https://api.elevenlabs.io wss://api.elevenlabs.io https://en.wikipedia.org https://en.wikisource.org",
  "manifest-src 'self'",
  "worker-src 'self'",
  "media-src 'self' data: blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function cspPlugin(): Plugin {
  return {
    name: 'oudiency-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<!-- CSP -->',
        `<meta http-equiv="Content-Security-Policy" content="${CONTENT_SECURITY_POLICY}" />`,
      );
    },
  };
}

/**
 * Laad de broodletter en de standaard-displayletter vooraf, zodat ze tegelijk met het script
 * binnenkomen in plaats van pas na de CSS (sneller beeld, minder verspringen).
 */
const PRELOADED_FONTS =
  /(literata-latin-wght-normal|cormorant-garamond-latin-wght-normal)-[\w-]+\.woff2$/;

function fontPreloadPlugin(): Plugin {
  return {
    name: 'oudiency-font-preload',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const fonts = Object.keys(ctx.bundle ?? {}).filter((file) => PRELOADED_FONTS.test(file));
        const links = fonts
          .map(
            (file) =>
              `<link rel="preload" href="./${file}" as="font" type="font/woff2" crossorigin />`,
          )
          .join('\n    ');
        return links ? html.replace('</head>', `    ${links}\n  </head>`) : html;
      },
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  // Relatieve paden + HashRouter: de site werkt onder elke reponaam op GitHub Pages.
  base: './',
  plugins: [react(), tailwindcss(), cspPlugin(), fontPreloadPlugin()],
  resolve: {
    alias: [
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      // Bellen gaat via WebSocket: de WebRTC-bibliotheek van de ElevenLabs-SDK is overbodig.
      {
        find: /^livekit-client$/,
        replacement: fileURLToPath(new URL('./src/voice/livekitStub.ts', import.meta.url)),
      },
    ],
  },
  build: {
    target: 'es2022',
    sourcemap: false,
    chunkSizeWarningLimit: 700,
  },
});
