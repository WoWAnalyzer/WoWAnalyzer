module.exports = {
  "extends": "react-app",
  "rules": {
    "comma-dangle": ["warn", "always-multiline"],

    // Semicolons:
    'no-extra-semi': 'warn',
    semi: ['warn', 'always'],
    'semi-spacing': ['warn', { before: false, after: true }],

    // Vars:
    'no-var': 'warn',
    'prefer-const': ['warn', {
      destructuring: 'any',
      ignoreReadBeforeAssign: true,
    }],
    'one-var': ['warn', 'never'],
    'one-var-declaration-per-line': ['warn', 'always'],
    // https://github.com/airbnb/javascript#comparison--switch-blocks
    'no-case-declarations': 'warn',

    // PropTypes:
    'react/prop-types': ['warn', { ignore: [], customValidators: [] }],
    'react/no-unused-prop-types': ['warn', {
      customValidators: [
      ],
      skipShapeProps: true,
    }],

    // Imports:
    'import/first': ['warn', 'absolute-first'],
  },
};
