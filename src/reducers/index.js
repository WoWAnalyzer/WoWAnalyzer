import { combineReducers } from 'redux';

export default combineReducers({
  reportCode: require('./reportCode').default,
  report: require('./report').default,

  error: require('./error').default,
});
