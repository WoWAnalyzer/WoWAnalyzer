/// <reference types="vitest/config" />

import { join } from 'node:path';
import process from 'node:process';

import { lingui } from '@lingui/vite-plugin';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react-swc';
import { globSync } from 'glob';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import svgr from 'vite-plugin-svgr';
import checker from 'vite-plugin-checker';

const GOOGLE_ANALYTICS_SCRIPT = `
<script async src="https://www.googletagmanager.com/gtag/js?id=G-MW95W6NHVC"></script>
<script>
var ramp = {
  passiveMode: true,
  que: [],
  onReady: function () {
    window.refreshAds();
  },
};
</script>
<script
  async
  src="//cdn.intergient.com/1024476/73270/ramp.js"
  onerror="window.adScriptFailed=true;"
></script>
<script>
window._pwGA4PageviewId = ''.concat(Date.now());
window.dataLayer = window.dataLayer || [];
window.gtag =
  window.gtag ||
  function () {
    dataLayer.push(arguments);
  };
gtag('js', new Date());
gtag('config', 'G-MW95W6NHVC', { send_page_view: false });
gtag('config', 'G-E0TKKBEXVD', { send_page_view: false });
gtag('event', 'ramp_js', { send_to: 'G-E0TKKBEXVD', pageview_id: window._pwGA4PageviewId });
</script>
</head>
`.trim();

const HASH_ONLY_CHUNKS = new Set(['StatTracker']);

// https://vitejs.dev/config/
export default defineConfig((env) => ({
  build: {
    cssMinify: env.mode === 'production',
    sourcemap: env.mode === 'production',
    rollupOptions: {
      output: {
        chunkFileNames: (chunkInfo) => {
          if (HASH_ONLY_CHUNKS.has(chunkInfo.name)) {
            return 'assets/[hash].js';
          }
          return 'assets/[name]-[hash].js';
        },
      },
    },
  },
  plugins: [
    tsconfigPaths(),
    react({
      plugins: [
        ['@swc/plugin-emotion', {}],
        // always enabled because it powers the macros
        ['@lingui/swc-plugin', {}],
      ],
    }),
    {
      name: 'vite-plugin-wowanalyzer-index-html-inject-ga',
      transformIndexHtml: (html) =>
        process.env.VITE_ENABLE_GA === 'true'
          ? html.replace('</head>', GOOGLE_ANALYTICS_SCRIPT)
          : html,
    },
    lingui(),
    svgr(),
    process.env.SENTRY_AUTH_TOKEN
      ? sentryVitePlugin({
          org: 'wowanalyzer',
          project: 'wowanalyzer-app',
          disable: env.mode !== 'production',
          authToken: process.env.SENTRY_AUTH_TOKEN,
          release: {
            setCommits: {
              auto: true,
            },
          },
          sourcemaps: {
            filesToDeleteAfterUpload: globSync(['./dist/**/*.map']),
          },
          bundleSizeOptimizations: {
            excludeDebugStatements: true,
          },
        })
      : null,
    !process.env.VITEST && !process.env.DISABLE_CHECKER_PLUGIN
      ? checker({ typescript: true })
      : undefined,
  ],
  optimizeDeps: {
    include: ['@emotion/styled/base'],
  },
  resolve: {
    alias: {
      analysis: join(__dirname, 'src', 'analysis'),
      common: join(__dirname, 'src', 'common'),
      game: join(__dirname, 'src', 'game'),
      interface: join(__dirname, 'src', 'interface'),
      localization: join(__dirname, 'src', 'localization'),
      parser: join(__dirname, 'src', 'parser'),
      // TEMP this fixes build errors while some retail specs are disabled
      // vite-tsconfig-paths does not support the `files` option
      CONTRIBUTORS: join(__dirname, 'src', 'CONTRIBUTORS'),
    },
  },
  server: {
    open: true,
    port: 3000,
    watch: {
      ignored: ['**/.direnv/**'],
    },
  },
  test: {
    environment: 'jsdom',
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cypress/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
      '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
    ],
    setupFiles: ['./src/vitest.setup.ts'],
    threads: true,
    environmentOptions: {
      jsdom: {
        resources: 'usable',
      },
    },
    resolveSnapshotPath: (testPath: string, snapExtension: string) => testPath + snapExtension,
    css: false,
    reporters: [['default', { summary: true }], 'hanging-process'],
  },
}));
