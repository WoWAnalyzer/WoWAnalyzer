import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

export default combineReducers({
  // System
  router: routerReducer,
  error: require('./error').default,

  // App
  report: require('./report').default,
  combatants: require('./combatants').default,
  reportHistory: require('./reportHistory').default,
});
