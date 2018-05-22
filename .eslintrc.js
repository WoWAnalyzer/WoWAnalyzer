module.exports = {
  extends: 'wowanalyzer-app',
  rules: {
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

    // disallow use of new operator when not part of the assignment or comparison
    'no-new': 'warn',

    // disallow use of assignment in return statement
    'no-return-assign': ['warn', 'always'],

    // disallow redundant `return await`
    'no-return-await': 'warn',

    // disallow use of void operator
    // https://eslint.org/docs/rules/no-void
    'no-void': 'warn',

    // require or disallow Yoda conditions
    yoda: 'warn',

    // Enforces that a return statement is present in property getters
    // https://eslint.org/docs/rules/getter-return
    'getter-return': ['warn', { allowImplicit: true }],

    // Disallow await inside of loops
    // https://eslint.org/docs/rules/no-await-in-loop
    'no-await-in-loop': 'warn',

    // disallow use of constant expressions in conditions
    'no-constant-condition': 'warn',

    // disallow use of debugger
    'no-debugger': 'warn',

    // disallow empty statements
    'no-empty': 'warn',

    // Disallow using indexOf when we have includes
    'no-restricted-syntax': [
      'warn',
      {
        selector: "BinaryExpression > CallExpression > MemberExpression > Identifier[name = 'indexOf']",
        message: 'Please use `includes` instead of `indexOf`. If you use `indexOf` to actually get the index of something, this is a false positive that can be ignored with // eslint-disable-next-line no-restricted-syntax',
      },
      'WithStatement',
      {
        selector: "BinaryExpression[operator='in']",
        message: 'Please do a comparison for `undefined` rather than use the `in` operator (consistent with the rest of the codebase)',
      },
    ],
  }
};
