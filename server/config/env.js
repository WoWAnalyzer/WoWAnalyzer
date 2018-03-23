const fs = require('fs');
const path = require('path');

// The source pre-modifications: https://github.com/facebook/create-react-app/blob/33f1294f07a884ca2628fb6d8dc648bd18b25fbe/packages/react-scripts/config/env.js#L25-L49
export default function loadDotEnv(rootPath) {
  const dotEnvPath = path.resolve(rootPath, '.env');
  const NODE_ENV = process.env.NODE_ENV;
  if (!NODE_ENV) {
    throw new Error(
      'The NODE_ENV environment variable is required but was not specified.'
    );
  }

  // https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
  var dotenvFiles = [
    `${dotEnvPath}.${NODE_ENV}.local`,
    `${dotEnvPath}.${NODE_ENV}`,
    // Don't include `.env.local` for `test` environment
    // since normally you expect tests to produce the same
    // results for everyone
    NODE_ENV !== 'test' && `${dotEnvPath}.local`,
    dotEnvPath,
  ].filter(Boolean);

  // Load environment variables from .env* files. Suppress warnings using silent
  // if this file is missing. dotenv will never modify any environment variables
  // that have already been set.
  // https://github.com/motdotla/dotenv
  dotenvFiles.forEach(dotenvFile => {
    if (fs.existsSync(dotenvFile)) {
      require('dotenv').config({
        path: dotenvFile,
      });
    }
  });
}
