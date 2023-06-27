const { override, babelInclude, getBabelLoader } = require('customize-cra');
const path = require('path');

const disablePlugins = (plugins) => (config) => ({
  ...config,
  plugins: config.plugins.filter((plugin) => !plugins.includes(plugin.constructor.name)),
});
const reportPlugins = () => (config) => {
  console.log(config.plugins.map((plugin) => plugin.constructor.name));
  process.exit();
};

// Needed to ignore the mini-css-extract-plugin warnings which can not be fixed with a good solution
// See https://stackoverflow.com/a/67579319
const ignoreOrderMiniCssExtractPlugin = (config) => {
  const webpackEnv = process.env.NODE_ENV;
  if (webpackEnv === 'production') {
    // eslint-disable-next-line import/no-extraneous-dependencies
    const MiniCssExtractPlugin = require('mini-css-extract-plugin');
    const instanceOfMiniCssExtractPlugin = config.plugins.find(
      (plugin) => plugin instanceof MiniCssExtractPlugin,
    );
    instanceOfMiniCssExtractPlugin.options.ignoreOrder = true;
  }
  return config;
};

function addEmotion(config) {
  const loader = getBabelLoader(config);
  loader.options.plugins = ['@emotion', ...loader.options.plugins];
  return config;
}

module.exports = override(
  addEmotion,
  babelInclude([path.resolve('./src')]),
  ignoreOrderMiniCssExtractPlugin,
  // customize-cra's disableEsLint disables the rules, but disabling the entire
  // plugin seem to give us more performance.
  process.env.DISABLE_AUTOMATIC_ESLINT && disablePlugins(['ESLintWebpackPlugin']),
  process.env.DISABLE_AUTOMATIC_ESLINT && disablePlugins(['ForkTsCheckerWebpackPlugin']),
  // addBabelPlugin('babel-plugin-transform-typescript-metadata'),
);
