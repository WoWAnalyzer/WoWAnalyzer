module.exports = {
  "extends": "./.eslintrc.js",
  "rules": {
    // Inspired from https://github.com/airbnb/javascript#blocks--cuddled-elses

    // https://github.com/airbnb/javascript#variables--unary-increment-decrement
    'no-plusplus': 'warn',
    // https://github.com/airbnb/javascript#comparison--unneeded-ternary
    'no-unneeded-ternary': 'warn',

    // https://github.com/airbnb/javascript#blocks--cuddled-elses
    'brace-style': ['warn', '1tbs', { allowSingleLine: true }],
  },
};
