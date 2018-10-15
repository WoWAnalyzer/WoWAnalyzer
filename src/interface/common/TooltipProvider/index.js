if (process.env.REACT_APP_WOW_DATABASE === 'wowhead') {
  module.exports = require('./Wowhead');
} else if (process.env.REACT_APP_WOW_DATABASE === 'wowdb') {
  module.exports = require('./Wowdb');
} else {
  throw new Error('Unknown WoW database.');
}
