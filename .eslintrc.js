const CHECK_CODESTYLE = process.env.CODE_STYLE === 'true';
const CI = Boolean(process.env.CI);
const CHECK_SPELL_OBJECT = process.env.CHECK_SPELL_OBJECT === 'true';

module.exports = {
  extends: ['@martijnhols/eslint-config', 'plugin:react/jsx-runtime'],
  plugins: ['wowanalyzer', 'progress'],
  rules: {
    'progress/activate': 1,
    'prettier/prettier': 0,
    'wowanalyzer/module-spread-parent-dependencies': 'error',
    'wowanalyzer/spell-link-spell-object': CHECK_SPELL_OBJECT ? 'error' : 'off',
    'wowanalyzer/spell-icon-spell-object': CHECK_SPELL_OBJECT ? 'error' : 'off',
    'wowanalyzer/boring-spell-value-text-spell-object': CHECK_SPELL_OBJECT ? 'error' : 'off',
    'wowanalyzer/lingui-t-macro-outside-jsx': 'error',
    'no-use-before-define': 'off',
    'import/order': [
      // This is an annoying code style rule that can be fixed automatically.
      // Only check it during the precommit fix script, and in CI.
      CHECK_CODESTYLE ? 'warn' : 'off',
      {
        groups: [['external', 'builtin'], 'internal', ['parent', 'sibling', 'index']],
        pathGroups: [
          {
            pattern: '@wowanalyzer/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['builtin'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    'import/no-extraneous-dependencies': [CI ? 'warn' : 'off'],
  },
  overrides: [
    // Disable some rules for .js files to not have to update all old files in one go
    {
      files: ['**/*.js'],
      rules: {
        'react/prefer-stateless-function': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
      },
    },
    // Disable a set for now to enable incrementally to allow for partial implementation
    {
      files: ['**/*.js', '**/*.ts?(x)'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'react/display-name': 'off',
        // This one in particular hurts:
        '@typescript-eslint/no-non-null-assertion': 'off',
        // Needs manual resolution, but has about 400 errors:
        '@typescript-eslint/no-unused-expressions': 'off',
      },
    },
    {
      // disable propTypes checking in typescript files. many false positives with destructuring
      files: ['**/*.tsx', '**/*.ts'],
      rules: {
        'react/prop-types': 'off',
      },
    },
  ],
};
