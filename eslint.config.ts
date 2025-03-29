import js from '@eslint/js';
import globals from 'globals';
import react from '@eslint-react/eslint-plugin';
import tseslint from 'typescript-eslint';
import wowanalyzer from 'eslint-plugin-wowanalyzer';

// replacement for .eslintignore
const ignores = tseslint.config({
  name: 'wowanalyzer-ignores',
  ignores: [
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**',
    '**/pnpm-lock.yaml',

    '**/e2e/**',
    '**/scripts/**',

    'src/localization/**/*.js',

    '**/playwright-report/**',
    '**/test-results/**',

    'packages/eslint-plugin-wowanalyzer/**',

    'eslint.config.ts',
    'lingui.config.ts',
    'playwright.config.ts',
    'vite.config.ts',
  ],
});

const base = tseslint.config({
  name: 'wowanalyzer-base',
  languageOptions: {
    ecmaVersion: 2022,
    globals: {
      ...globals.browser,
      ...globals.es2022,
      ...globals.node,
      document: 'readonly',
      navigator: 'readonly',
      window: 'readonly',
    },

    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      ecmaVersion: 2022,
      sourceType: 'module',
    },
  },
  linterOptions: {
    reportUnusedDisableDirectives: true,
  },
});

// JS file configs
const javascript = tseslint.config({
  name: 'wowanalyzer-javascript',
  files: ['**/*.{js,jsx,cjs,mjs}'],
  extends: [js.configs.recommended, react.configs.recommended, wowanalyzer.configs.recommended],
  rules: {
    // Enforce default clauses in switch statements to be last
    'default-case-last': 'warn',
    // Disallow nested ternary expressions
    'no-nested-ternary': 'warn',
    // Prefer the arrow callback of ES6 where possible
    'prefer-arrow-callback': 'warn',
    // don't allow unused expressions
    'no-unused-expressions': 'warn',
  },
});

// TS file configs
const typescript = tseslint.config({
  name: 'wowanalyzer-typescript',
  files: ['**/*.{ts,tsx,cts,mts}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    react.configs['recommended-typescript'],
    wowanalyzer.configs.recommended,
  ],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
});

export default tseslint.config(ignores, base, javascript, typescript);
