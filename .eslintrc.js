module.exports = {
  'extends': 'wowanalyzer-app',
  'rules': {
    // Based on https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/best-practices.js:

    // require return statements to either always or never specify values
    'consistent-return': 'warn',

    // specify curly brace conventions for all control statements
    curly: ['warn', 'multi-line'],

    // encourages use of dot notation whenever possible
    'dot-notation': ['warn', { allowKeywords: true }],

    // disallow use of multiple spaces
    'no-multi-spaces': ['warn', {
      ignoreEOLComments: false,
    }],
  },
};
