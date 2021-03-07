import { combineReducers } from 'redux';

import { ReportState } from 'interface/reducers/report';
import { CharactersByIdState } from 'interface/reducers/charactersById';

export interface RootState {
  error: any;
  user: any;
  report: ReportState;
  combatants: any;
  reportHistory: any;
  language: any;
  specsIgnoredNotSupportedWarning: any;
  openModals: any;
  charactersById: CharactersByIdState;
  reportCodesIgnoredPreviousPatchWarning: any;
}

const createReducers = () => combineReducers({
  // System
  error: require('./error').default,

  // App
  user: require('./user').default,
  report: require('./report').default,
  combatants: require('./combatants').default,
  reportHistory: require('./reportHistory').default,
  language: require('./language').default,
  specsIgnoredNotSupportedWarning: require('./specsIgnoredNotSupportedWarning').default,
  openModals: require('./openModals').default,

  // Caching
  charactersById: require('./charactersById').default,
  reportCodesIgnoredPreviousPatchWarning: require('./reportCodesIgnoredPreviousPatchWarning').default,
});

export default createReducers;
