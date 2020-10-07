const {
  override,
  useEslintRc,
  disableEsLint,
} = require('customize-cra');

module.exports = override(
  process.env.DISABLE_AUTOMATIC_ESLINT ? disableEsLint() : undefined,
  // addBabelPlugin('babel-plugin-transform-typescript-metadata'),
);
