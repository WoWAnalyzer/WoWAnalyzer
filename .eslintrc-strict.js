module.exports = {
  "extends": "./.eslintrc.js",
  "rules": {
    // Based on https://github.com/airbnb/javascript#blocks--cuddled-elses

    // Variables
    // https://github.com/airbnb/javascript#variables--unary-increment-decrement
    'no-plusplus': 'warn',
    // Comparison Operators & Equality
    // https://github.com/airbnb/javascript#comparison--unneeded-ternary
    'no-unneeded-ternary': 'warn',

    // Blocks
    // https://github.com/airbnb/javascript#blocks--cuddled-elses
    'brace-style': ['warn', '1tbs', { allowSingleLine: true }],

    // Whitespace
    // https://github.com/airbnb/javascript#whitespace--spaces
    indent: ['warn', 2, {
      SwitchCase: 1,
      VariableDeclarator: 1,
      outerIIFEBody: 1,
      // MemberExpression: null,
      // CallExpression: {
      //   parameters: null,
      // },
      FunctionDeclaration: {
        parameters: 1,
        body: 1
      },
      FunctionExpression: {
        parameters: 1,
        body: 1
      }
    }],
    // https://github.com/airbnb/javascript#whitespace--before-blocks
    'space-before-blocks': 'warn',
    // https://github.com/airbnb/javascript#whitespace--around-keywords
    'keyword-spacing': ['warn', {
      before: true,
      after: true,
      overrides: {
        return: { after: true },
        throw: { after: true },
        case: { after: true }
      }
    }],
    // https://github.com/airbnb/javascript#whitespace--infix-ops
    'space-infix-ops': 'warn',
    // https://github.com/airbnb/javascript#whitespace--newline-at-end
    'eol-last': ['warn', 'always'],
    // https://github.com/airbnb/javascript#whitespace--padded-blocks
    'padded-blocks': ['warn', { blocks: 'never', classes: 'never', switches: 'never' }],
    // https://github.com/airbnb/javascript#whitespace--in-parens
    'space-in-parens': ['warn', 'never'],
    // https://github.com/airbnb/javascript#whitespace--in-brackets
    'array-bracket-spacing': ['warn', 'never'],
    // https://github.com/airbnb/javascript#whitespace--in-braces
    'object-curly-spacing': ['warn', 'always'],

    // Commas
    'comma-style': ['warn', 'last'],

    // Naming Conventions
    // Can't enable camelcase since our `on_` event handlers don't follow it, and it also doesn't make sense for tier19_4set to be flagged (tier194set is terrible, as are other alternatives)
    // https://github.com/airbnb/javascript#naming--camelCase
    // camelcase: ['warn', { properties: 'never' }],
    // https://github.com/airbnb/javascript#naming--PascalCase
    'new-cap': ['warn', {
      newIsCap: true,
      newIsCapExceptions: [],
      capIsNew: false,
      capIsNewExceptions: ['Immutable.Map', 'Immutable.Set', 'Immutable.List'],
    }],
  },
};
