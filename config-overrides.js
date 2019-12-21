const {
  override,
  useEslintRc,
  disableEsLint,
} = require('customize-cra');

module.exports = override(
  process.env.DISABLE_AUTOMATIC_ESLINT ? disableEsLint() : useEslintRc(),
  // addBabelPlugin('babel-plugin-transform-typescript-metadata'),
);
