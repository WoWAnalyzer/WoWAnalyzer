const { override, babelInclude, addBabelPlugin } = require('customize-cra');
const path = require('path');

const disablePlugins = (plugins) => (config) => ({
  ...config,
  plugins: config.plugins.filter((plugin) => !plugins.includes(plugin.constructor.name)),
});
const reportPlugins = () => (config) => {
  console.log(config.plugins.map((plugin) => plugin.constructor.name));
  process.exit();
};
const fixLingui = () => (config) => {
  config.module.rules = [
    ...config.module.rules,
    // Fix for lingui loader https://github.com/lingui/js-lingui/issues/1048#issuecomment-822785379
    {
      resourceQuery: /as-js/,
      type: 'javascript/auto',
    },
  ];
  return config;
};

module.exports = override(
  addBabelPlugin('@emotion'),
  babelInclude([path.resolve('./src')]),
  fixLingui(),
  // customize-cra's disableEsLint disables the rules, but disabling the entire
  // plugin seem to give us more performance.
  process.env.DISABLE_AUTOMATIC_ESLINT && disablePlugins(['ESLintWebpackPlugin']),
  process.env.DISABLE_AUTOMATIC_ESLINT && disablePlugins(['ForkTsCheckerWebpackPlugin']),
  // addBabelPlugin('babel-plugin-transform-typescript-metadata'),
);
