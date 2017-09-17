module.exports = {
  extends: 'airbnb',
  rules: {
    // Only force for objects and arrays, inside functions is still considered a syntax error.
    'comma-dangle': ['warn', {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'never',
    }],

    // Disable 'arrow-body-style' as there are common situations where not following this rule improves readability
    // https://github.com/airbnb/javascript#arrows--implicit-return
    'arrow-body-style': 'off',

    // Naming Conventions
    // Can't enable camelcase since our `on_` event handlers don't follow it, and it also doesn't make sense for tier19_4set to be flagged (tier194set is terrible, as are other alternatives)
    // https://github.com/airbnb/javascript#naming--camelCase
    camelcase: 'off',

    // This is only in the way, requiring constant change. Most IDEs have soft wrapping now (GitHub too), use that to prevent horizontal scrolling at any screen size.
    'max-len': 'off',

    // We use underscors for indicating private properties. This is a promise we make to each other and is policed in PRs.
    'no-underscore-dangle': 'off',

    // We want to be able to leave this behind to help us fix things if we get back to the module.
    'no-console': 'off',

    // Reusing names is often clearer and easier than making up something new that's unique, if done carefully this shouldn't cause any issues.
    'no-shadow': 'off',

    // Requiring changing the filename whenever something grows to have JSX is not desirable.
    'react/jsx-filename-extension': 'off',

    // We don't use nor check the proptypes extensively and don't want to be in the way of developers this much.
    'react/forbid-prop-types': 'off',

    // Some methods simply need `this`, and doing it any other way is annoying and hidden in an unrelated method.
    'react/jsx-no-bind': 'off',

    // While this makes sense for < and >, requiring ' to be escaped is not going to make anyone happy.
    'react/no-unescaped-entities': 'off',

    // This detects lines such as `debug && console.log(...)`, while this rule could be useful, it would require making lines like this example less readable and should therefore be off.
    'no-unused-expressions': 'off',

    // It's more readable than having else-ifs on the first level
    'no-lonely-if': 'off',

    // Making half the code-base static does not improve code quality, and some methods are meant to be extended and who knows what they'll get then, and sometimes it's right.
    'class-methods-use-this': 'off',

    // `undefined` is a perfectly fine default
    'react/require-default-props': 'off',
  },
  settings: {
    'import/resolver': {
      node: {
        moduleDirectory: [
          'node_modules',
          'src',
        ],
      },
    },
  },
};
