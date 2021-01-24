const path = require('path');
const { override, disableEsLint, babelInclude } = require('customize-cra');
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
  babelInclude([
    path.resolve('./src'),
    new RegExp(`^${process.cwd()}/.*/?node_modules/@wowanalyzer/[^/]+/src/`),
    // Temporary directories until these are migrated to workspaces
    new RegExp(`^${process.cwd()}/.*/?node_modules/(interface|parser|common)/`),
  ]),
  (config) => {
    // Disabling symlink resolving allows us to link @wowanalyzer packages from any random
    // directory and still have its TypeScript compiled by CRA through the babelInclude above.
    config.resolve.symlinks = false;
    return config;
  },
  process.env.DISABLE_AUTOMATIC_ESLINT && disableEsLint(),
  process.env.DISABLE_AUTOMATIC_ESLINT && disableTypeChecking(),
  // addBabelPlugin('babel-plugin-transform-typescript-metadata'),
);
