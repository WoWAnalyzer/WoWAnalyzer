process.env.BABEL_ENV = 'development';
process.env.NODE_ENV = 'development';

const path = require('path');

// make require respect tsconfig.json paths
require('tsconfig-paths').register({
  baseUrl: path.join(__dirname, '..', '..', 'src'),
  paths: [],
});

// use babel to transpile required files
require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
  extensions: ['.es6', '.es', '.jsx', '.mjs', '.js', '.ts', '.tsx'],
});

// make require load images and CSS as empty strings
require.extensions['.jpg'] = () => (module.exports = '');
require.extensions['.jpeg'] = () => (module.exports = '');
require.extensions['.png'] = () => (module.exports = '');
require.extensions['.css'] = () => (module.exports = '');
require.extensions['.scss'] = () => (module.exports = '');

// make React load as empty strings because we don't care about React for our purposes
global.React = {
  createElement() {
    return '';
  },
};

require('./generate-configs').generateConfigs();
