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

    // REMOVE SPECS FROM HERE ONCE THEY ARE SUPPORTED
    'src/analysis/retail/deathknight/blood/**',
    'src/analysis/retail/deathknight/frost/**',
    'src/analysis/retail/deathknight/unholy/**',
    'src/analysis/retail/druid/balance/**',
    'src/analysis/retail/druid/guardian/**',
    'src/analysis/retail/druid/feral/**',
    'src/analysis/retail/druid/restoration/**',
    'src/analysis/retail/druid/shared/**',
    'src/analysis/retail/evoker/augmentation/**',
    'src/analysis/retail/evoker/devastation/**',
    'src/analysis/retail/evoker/preservation/**',
    'src/analysis/retail/evoker/shared/**',
    'src/analysis/retail/hunter/beastmastery/**',
    'src/analysis/retail/hunter/marksmanship/**',
    'src/analysis/retail/hunter/survival/**',
    'src/analysis/retail/hunter/shared/**',
    'src/analysis/retail/mage/arcane/**',
    'src/analysis/retail/mage/fire/**',
    'src/analysis/retail/mage/frost/**',
    'src/analysis/retail/mage/shared/**',
    'src/analysis/retail/monk/brewmaster/**',
    'src/analysis/retail/monk/mistweaver/**',
    'src/analysis/retail/monk/windwalker/**',
    'src/analysis/retail/monk/shared/**',
    'src/analysis/retail/paladin/holy/**',
    'src/analysis/retail/paladin/protection/**',
    'src/analysis/retail/paladin/retribution/**',
    'src/analysis/retail/paladin/shared/**',
    'src/analysis/retail/priest/discipline/**',
    'src/analysis/retail/priest/holy/**',
    'src/analysis/retail/priest/shadow/**',
    'src/analysis/retail/priest/shared/**',
    'src/analysis/retail/rogue/assassination/**',
    'src/analysis/retail/rogue/subtlety/**',
    'src/analysis/retail/rogue/outlaw/**',
    'src/analysis/retail/rogue/shared/**',
    'src/analysis/retail/shaman/elemental/**',
    'src/analysis/retail/shaman/enhancement/**',
    'src/analysis/retail/shaman/restoration/**',
    'src/analysis/retail/shaman/shared/**',
    'src/analysis/retail/warlock/affliction/**',
    'src/analysis/retail/warlock/demonology/**',
    'src/analysis/retail/warlock/destruction/**',
    'src/analysis/retail/warlock/shared/**',
    'src/analysis/retail/warrior/arms/**',
    'src/analysis/retail/warrior/fury/**',
    'src/analysis/retail/warrior/protection/**',
    'src/analysis/retail/warrior/shared/**',
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
    // the codebase has a large amount of both forms. i prefer Array<T> for complex T, but T[] is fine for other cases.
    // i don't want to bog people down in this minutia though
    '@typescript-eslint/array-type': 'off',
    // too noisy. we have to have keys and often are working with things with no other real option
    '@eslint-react/no-array-index-key': 'off',
  },
});

export default tseslint.config(ignores, base, javascript, typescript, tests, progressConfig);
