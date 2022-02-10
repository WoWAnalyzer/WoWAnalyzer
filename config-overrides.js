const { override, babelInclude } = require('customize-cra');
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
  babelInclude([
    path.resolve('./src'),
    new RegExp(`^${process.cwd()}/analysis/[^/]+/src/`),
    // Hello Windows
    new RegExp(`^${process.cwd().replace(/\\/g, '\\\\')}\\\\analysis\\\\[^\\\\]+\\\\src`),
  ]),
  fixLingui(),
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

  // customize-cra's disableEsLint disables the rules, but disabling the entire
  // plugin seem to give us more performance.
  process.env.DISABLE_AUTOMATIC_ESLINT && disablePlugins(['ESLintWebpackPlugin']),
  process.env.DISABLE_AUTOMATIC_ESLINT && disablePlugins(['ForkTsCheckerWebpackPlugin']),
  // addBabelPlugin('babel-plugin-transform-typescript-metadata'),
);
