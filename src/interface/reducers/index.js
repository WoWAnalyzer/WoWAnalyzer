import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

export default combineReducers({
  // System
  router: routerReducer,
  error: require('./error').default,

  // App
  user: require('./user').default,
  report: require('./report').default,
  reportProgress: require('./reportProgress').default,
  combatants: require('./combatants').default,
  reportHistory: require('./reportHistory').default,
  language: require('./language').default,
  specsIgnoredNotSupportedWarning: require('./specsIgnoredNotSupportedWarning').default,
  openModals: require('./openModals').default,

  // Caching
  charactersById: require('./charactersById').default,
});
