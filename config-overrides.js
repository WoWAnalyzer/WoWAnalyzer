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
    new RegExp(`^${process.cwd()}/analysis/[^/]+/src/`),
    // Hello Windows
    new RegExp(`^${process.cwd().replace(/\\/g, '\\\\')}\\\\analysis\\\\[^\\\\]+\\\\src`),
  ]),
  // TODO: Support linking packages. The below was disabled since it will make CRA show paths to
  //  node_modules for errors which make them harder to fix. It also likely makes Babel parse files
  //  twice, reducing performance. A better solution may be to keep symlinking enabled, and scan
  //  node_modules to see if any of the workspace-packages have been linked, and add those paths to
  //  the babelInclude on start. This is a lot more complex though. :(
  // babelInclude([
  //   path.resolve('./src'),
  //   new RegExp(`^${process.cwd()}/.*/?node_modules/@wowanalyzer/[^/]+/src/`),
  //   // Temporary directories until these are migrated to workspaces
  //   new RegExp(`^${process.cwd()}/.*/?node_modules/(interface|parser|common|game|raids)/`),
  // ]),
  // (config) => {
  //   // Disabling symlink resolving allows us to link @wowanalyzer packages from any random
  //   // directory and still have its TypeScript compiled by CRA through the babelInclude above.
  //   config.resolve.symlinks = false;
  //   return config;
  // },
  process.env.DISABLE_AUTOMATIC_ESLINT && disableEsLint(),
  process.env.DISABLE_AUTOMATIC_ESLINT && disableTypeChecking(),
  // addBabelPlugin('babel-plugin-transform-typescript-metadata'),
);
