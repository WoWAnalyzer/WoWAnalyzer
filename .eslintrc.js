module.exports = {
  extends: '@emico/eslint-config',
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
