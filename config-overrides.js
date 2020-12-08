const { override, disableEsLint } = require('customize-cra');
// eslint-disable-next-line import/no-extraneous-dependencies
// const EslintPlugin = require('eslint-webpack-plugin');
// eslint-disable-next-line import/no-extraneous-dependencies
const ForkTsCheckerWebpackPlugin = require('react-dev-utils/ForkTsCheckerWebpackPlugin');

// Enable when we upgrade to CRA v4:
// // customize-cra's disableEsLint disables the rules, but disabling the entire
// // plugin seem to give us more performance.
// const disableEsLint = () => (config) => ({
//   ...config,
//   plugins: config.plugins.filter((plugin) => !(plugin instanceof EslintPlugin)),
// });
const disableTypeChecking = () => (config) => ({
  ...config,
  plugins: config.plugins.filter((plugin) => !(plugin instanceof ForkTsCheckerWebpackPlugin)),
});

module.exports = override(
  process.env.DISABLE_AUTOMATIC_ESLINT && disableEsLint(),
  process.env.DISABLE_AUTOMATIC_ESLINT && disableTypeChecking(),
  // addBabelPlugin('babel-plugin-transform-typescript-metadata'),
);
