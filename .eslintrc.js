const CHECK_CODESTYLE = process.env.CODE_STYLE === 'true';

module.exports = {
  extends: '@emico/eslint-config',
  rules: {
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
        // This one in particular hurts
        '@typescript-eslint/no-non-null-assertion': 'off',
      },
    },
  ],
};
