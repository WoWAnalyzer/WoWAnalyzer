module.exports = {
  "extends": "react-app",
  "rules": {
    "comma-dangle": ["warn", "always-multiline"],

    // Semicolons
    'no-extra-semi': 'warn',
    semi: ['warn', 'always'],
    'semi-spacing': ['warn', { before: false, after: true }],

    // suggest using of const declaration for variables that are never modified after declared
    'no-var': 'warn',
    'prefer-const': ['warn', {
      destructuring: 'any',
      ignoreReadBeforeAssign: true,
    }],
    'one-var': ['warn', 'never'],
    'one-var-declaration-per-line': ['warn', 'always'],
  },
};
