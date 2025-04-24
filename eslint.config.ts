import js from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
// @ts-expect-error -- No types exist for this plugin
import progress from 'eslint-plugin-progress';
import vitest from '@vitest/eslint-plugin';
import wowanalyzer from 'eslint-plugin-wowanalyzer';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// replacement for .eslintignore
const ignores = tseslint.config({
  name: '@wowanalyzer/ignores',
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
  name: '@wowanalyzer/base',
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

// progress plugin if we're using a TTY
const progressConfig = tseslint.config({
  name: '@wowanalyzer/progress',
  plugins: {
    progress,
  },
  rules: {
    'progress/activate': process.stdout.isTTY ? 1 : 0,
  },
});

const tests = tseslint.config({
  name: '@wowanalyzer/tests',
  files: ['**/*.test.{js,jsx,ts,tsx}'],
  extends: [vitest.configs.recommended],

  languageOptions: {
    globals: {
      ...vitest.environments.env.globals,
      jest: 'readable',
    },
  },
});

// JS file configs
const javascript = tseslint.config({
  name: '@wowanalyzer/js',
  files: ['**/*.{js,jsx,cjs,mjs}'],
  extends: [
    js.configs.recommended,
    react.configs.recommended,
    reactHooks.configs['recommended-latest'],
    wowanalyzer.configs.recommended,
  ],
  rules: {
    // Enforce default clauses in switch statements to be last
    'default-case-last': 'warn',
    // Disallow nested ternary expressions
    'no-nested-ternary': 'warn',
    // Prefer the arrow callback of ES6 where possible
    'prefer-arrow-callback': 'warn',
    // don't allow unused expressions
    'no-unused-expressions': ['error', { allowTernary: true, allowShortCircuit: true }],
    // don't warn about legacy proptypes use. we'll get to the last few js files eventually
    '@eslint-react/no-prop-types': 'off',
    // too noisy. we have to have keys and often are working with things with no other real option
    '@eslint-react/no-array-index-key': 'off',
  },
});

// TS file configs
const typescript = tseslint.config({
  name: '@wowanalyzer/ts',
  files: ['**/*.{ts,tsx,cts,mts}'],
  extends: [
    js.configs.recommended,
    tseslint.configs.recommended,
    tseslint.configs.stylistic,
    react.configs['recommended-typescript'],
    reactHooks.configs['recommended-latest'],
    wowanalyzer.configs.recommended,
  ],
  languageOptions: {
    parserOptions: {
      projectService: true,
    },
  },
  rules: {
    '@eslint-react/dom/no-missing-button-type': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      { allowShortCircuit: true, allowTernary: true },
    ],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        args: 'none',
      },
    ],
    // too noisy. we have to have keys and often are working with things with no other real option
    '@eslint-react/no-array-index-key': 'off',
  },
});

export default tseslint.config(ignores, base, javascript, typescript, tests, progressConfig);
