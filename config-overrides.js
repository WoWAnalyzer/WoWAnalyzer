const { override, useEslintRc, disableEsLint } = require('customize-cra');

module.exports = override(
  process.env.DISABLE_AUTOMATIC_ESLINT ? disableEsLint() : useEslintRc(),
  (config, env) => config,
);
