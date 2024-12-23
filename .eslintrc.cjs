require('dotenv-flow').config({
  silent: true,
});

const CHECK_CODESTYLE = process.env.CODE_STYLE === 'true';
const CI = Boolean(process.env.CI);

module.exports = {
  extends: [
    'react-app',
    // https://github.com/eslint/eslint/blob/master/conf/eslint-recommended.js
    'eslint:recommended',
    // https://github.com/yannickcr/eslint-plugin-react/blob/master/index.js#L115
    'plugin:react/recommended',
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/eslint-recommended.ts
    'plugin:@typescript-eslint/eslint-recommended',
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/configs/recommended.json
    'plugin:@typescript-eslint/recommended',
    // We enable the prettier plugin even if ENABLE_PRETTIER is false since it
    // also disables rules that would conflict with Prettier. We need these
    // overrides even if we're ignoring Prettier rule problems.
    // https://prettier.io/docs/en/integrating-with-linters.html#recommended-configuration
    'plugin:prettier/recommended',
    // See https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore for
    // reasons why.
    // https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore/blob/master/lib/rules/all.js
    'plugin:you-dont-need-lodash-underscore/compatible',
    'plugin:react/jsx-runtime',
  ],
  plugins: ['wowanalyzer', 'progress', 'no-only-tests'],
  rules: {
    'progress/activate': process.stdout.isTTY ? 1 : 0,
    'prettier/prettier': 0,

    'wowanalyzer/module-spread-parent-dependencies': 'error',
    'wowanalyzer/spell-link-spell-object': 'error',
    'wowanalyzer/spell-icon-spell-object': 'error',
    'wowanalyzer/boring-spell-value-text-spell-object': 'error',
    'wowanalyzer/lingui-t-macro-outside-jsx': 'error',
    'wowanalyzer/event-meta-inefficient-cast': 'error',

    // region Syntax

    // Codebase consistency and ease of use
    'react/prefer-stateless-function': 'warn',

    // Swift removed ++ and -- completely for various good reasons:
    // https://github.com/apple/swift-evolution/blob/master/proposals/0004-remove-pre-post-inc-decrement.md#disadvantages-of-these-operators
    // Use one of the following instead:
    // foo(i++) -> foo(i); i += 1
    // foo(++i) -> i += 1; foo(i)
    // i-- -> i -= 1
    // for (let i = 0; i < arr.length; i++) -> for (let i = 0; i < arr.length; i += 1)
    // NOTE: For the last one, prefer arr.forEach(func)/map/reduce instead.
    'no-plusplus': 'warn',

    // Disallow multiple declarations with one const/let statement.
    'one-var': [
      'error',
      {
        initialized: 'never',
      },
    ],

    // Always prefer if-statements over expressions for both consistency and in general readability when paired with
    // early returns.
    'no-unused-expressions': 'off',
    '@typescript-eslint/no-unused-expressions': [
      'error',
      {
        allowShortCircuit: false, // a && a() might as well be a?.() or if (a) { a() }
        allowTernary: false, // ternary expressions without returning the result - just use an if-statement
        allowTaggedTemplates: false, // randomly placed strings are dead code
      },
    ],

    'no-restricted-syntax': [
      'warn',
      'WithStatement',
      {
        selector: 'ForInStatement',
        message:
          'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array or use for..of.',
      },
      {
        selector: "CallExpression[callee.name='setTimeout'][arguments.length!=2]",
        message: 'setTimeout must always be invoked with two arguments.',
      },
      {
        selector: "CallExpression[callee.name='useLazyQuery']",
        message:
          'Prefer apolloClient.query in handlers over useLazyQuery hooks. The useLazyQuery introduce misdirection that makes code hard to follow, especially when the behavior gets more complicated. Error handling also improves using apolloClient.query.',
      },
      {
        selector: "CallExpression[callee.name='useMutation']",
        message:
          'Prefer apolloClient.mutate in handlers over useMutation hooks. The useMutation introduce misdirection that makes code hard to follow, especially when the behavior gets more complicated. Error handling also improves using apolloClient.mutate.',
      },
    ],

    // if (!a > b) will convert a into a boolean since ! has precendence over >
    // Note: @typescript-eslint disables this for TS files since TS also checks for this.
    'no-unsafe-negation': ['error', { enforceForOrderingRelations: true }],

    // endregion

    // region Types

    // Allow implicit return types. This should make it easier to change code
    // as it doesn't require you to change a load of types in addition. In React
    // code it would be doubly annoying, as we'd have to specify the return type
    // of each functional component.
    // This should not have an impact on type safety, as any input relying on a
    // specific type should have that type specified.
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',

    // Allow explicit property/parameter types so they can be consistent with
    // their sibling properties/parameters that have no default value.
    '@typescript-eslint/no-inferrable-types': [
      'warn',
      {
        ignoreParameters: true,
        ignoreProperties: true,
      },
    ],

    // Standardise the user of type assertion style
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'never',
      },
    ],

    // endregion

    // region Code style

    // Disable specific member delimiter style for interfaces and type literals.
    // We don't need an eslint rule for this, as Prettier will already enforce
    // this.
    '@typescript-eslint/member-delimiter-style': 'off',

    'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],

    curly: ['warn', 'all'],

    // When using a boolean attribute in JSX, you can set the attribute value to true or omit the value.
    // This rule will enforce one or the other to keep consistency in your code
    'react/jsx-boolean-value': ['warn', 'never'],

    // Suggests to convert () => { return x; } to () => x.
    'arrow-body-style': [
      // This is an annoying code style rule that can be fixed automatically.
      // Only check it during the precommit fix script, and in CI.
      CHECK_CODESTYLE ? 'warn' : 'off',
      'as-needed',
    ],

    // Do not require explicit visibility declarations for class members.
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      {
        accessibility: 'off',
        overrides: {
          parameterProperties: 'off',
          accessors: 'off',
          // public constructor() would be silly
          constructors: 'no-public',
          methods: 'off',
          properties: 'off',
        },
      },
    ],

    // Requires using either ‘T[]’ or ‘Array' for arrays.
    // enforces use of T[] if T is a simple type (primitive or type reference).
    '@typescript-eslint/array-type': [
      CHECK_CODESTYLE ? 'warn' : 'off',
      {
        default: 'array-simple',
      },
    ],

    // Parameter properties can be confusing to those new to TypeScript as they are less explicit than other ways of declaring and initializing class members.
    '@typescript-eslint/parameter-properties': 'error',

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

    'no-implicit-coercion': 'warn',

    'import/no-useless-path-segments': 'warn',
    // Shorter, no useless var, and not really a big difference
    'import/no-anonymous-default-export': 'off',

    // endregion

    // Every dependency should be in the package.json
    'import/no-extraneous-dependencies': [CI ? 'warn' : 'off'],

    'no-restricted-imports': [
      'error',
      {
        name: '..',
        message: "Importing '..' can cause issues that are hard to find.",
      },
      {
        name: '.',
        message: "Importing '.' can cause issues that are hard to find.",
      },
    ],

    // Allow using any characters in children texts to keep things easy to
    // maintain and concise. We internationalize all messages anyway, so
    // translators can use the correct typography for their language and we
    // can do whatever is quickest.
    'react/no-unescaped-entities': 0,

    // "only" filter for tests are commonly used during development and rarely desired in git (use .skip instead)
    'no-only-tests/no-only-tests': 'error',

    // https://github.com/jsx-eslint/eslint-plugin-react/blob/master/docs/rules/jsx-key.md
    // Ensure that the key attribute is always used in a list of elements.
    'react/jsx-key': [
      'error',
      {
        checkFragmentShorthand: true,
        checkKeyMustBeforeSpread: true,
        warnOnDuplicates: true,
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
        // We only write JS when we need something to run in node.js without
        // first compiling it. In that case, usually, we can't use module
        // imports either.
        '@typescript-eslint/no-var-requires': 'off',
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
