// @ts-check

import eslint from '@eslint/js';
import react from '@eslint-react/eslint-plugin';
import depend from 'eslint-plugin-depend';
import globals from 'globals';
import tseslint, { config } from 'typescript-eslint';

// config with just ignores is the replacement for `.eslintignore`
const ignoresConfig = config({
  ignores: [
    '**/node_modules/**',
    '**/build/**',
    '**/dist/**',
    '**/pnpm-lock.yaml',

    'src/localization/**/*.js',

    '**/playwright-report/**',
    '**/test-results/**',
  ],
});

// General eslint recommended rules
const eslintConfig = config(eslint.configs.recommended, {
  rules: {
    /** Code quality rules */
    //Enforce default clauses in switch statements to be last
    'default-case-last': 'warn',
    //Disallow nested ternary expressions
    'no-nested-ternary': 'warn',
    //Prefer the arrow callback of ES6 where possible
    'prefer-arrow-callback': 'warn',
  },
});

// General typescript-eslint rules that have type knowledge
const typescriptEslintConfig = config(
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    rules: {
      /** Rules that need to be turned off in default eslint to be turned on in Typescript ESLint */
      //Enforce default parameters to be last
      '@typescript-eslint/default-param-last': 'warn',
      'default-param-last': 'off',
      //Disallow variable declarations from shadowing variables declared in the outer scope
      '@typescript-eslint/no-shadow': 'warn',
      'no-shadow': 'off',
      //Disallow variable redeclaration
      '@typescript-eslint/no-redeclare': 'warn',
      'no-redeclare': 'off',

      //Emulate the TypeScript style of exempting names starting with _
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          ignoreRestSiblings: true,
          varsIgnorePattern: '^_',
        },
      ],

      /** Stylistic rules */
      //Prefer using Array<T> over T[]
      '@typescript-eslint/array-type': ['warn', { default: 'generic', readonly: 'generic' }],
      //We want to encourage marking type imports explicitly which is also enforced by TypeScripts --verbatimModuleSyntax
      '@typescript-eslint/consistent-type-imports': 'warn',
      //We want to encourage marking type exports explicitly
      '@typescript-eslint/consistent-type-exports': 'warn',
      //Enforce the use of top-level import type qualifer when an import only has specifiers with inline type qualifiers
      '@typescript-eslint/no-import-type-side-effects': 'warn',
    },
  },
);

// Dependency guidance to migrate off other dependencies
const dependConfig = config(depend.configs['flat/recommended']);

const reactConfig = config(react.configs['recommended-type-checked']);

const disableTypeCheckedOnJS = config({
  extends: [tseslint.configs.disableTypeChecked, react.configs['disable-type-checked']],
  files: ['**/*.js', '**/*.[cm]js', '**/*.jsx'],
});

export default tseslint.config(
  ...ignoresConfig,

  // base config
  {
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
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      sourceType: 'module',
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },

  // extends ...
  ...eslintConfig,
  ...typescriptEslintConfig,
  ...dependConfig,
  ...reactConfig,
  ...disableTypeCheckedOnJS,
);
