module.exports = {
  extends: 'react-app',
  parser: 'babel-eslint',
  rules: {
    // https://github.com/airbnb/javascript#commas--dangling
    'comma-dangle': ['warn', 'always-multiline'],

    // Objects
    // https://github.com/airbnb/javascript#objects--no-new
    'no-new-object': 'warn',

    // Semicolons:
    'no-extra-semi': 'warn',
    // https://github.com/airbnb/javascript#semicolons--required
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

    // https://github.com/airbnb/javascript#coercion--numbers
    radix: 'warn',
  },
};
