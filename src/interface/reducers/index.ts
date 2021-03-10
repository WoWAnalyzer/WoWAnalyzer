import { combineReducers } from 'redux';

import { ReportState } from 'interface/reducers/report';
import { CharactersByIdState } from 'interface/reducers/charactersById';
import { SpecsIgnoredNotSupportedWarningState } from 'interface/reducers/specsIgnoredNotSupportedWarning';
import { CombatantsState } from 'interface/reducers/combatants';
import { ReportCodesIgnoredPreviousPatchWarning } from 'interface/reducers/reportCodesIgnoredPreviousPatchWarning';
import { LanguageState } from 'interface/reducers/language';
import { ModalState } from 'interface/reducers/openModals';

export interface RootState {
  error: any;
  user: any;
  report: ReportState;
  combatants: CombatantsState;
  reportHistory: any;
  language: LanguageState;
  specsIgnoredNotSupportedWarning: SpecsIgnoredNotSupportedWarningState;
  openModals: ModalState;
  charactersById: CharactersByIdState;
  reportCodesIgnoredPreviousPatchWarning: ReportCodesIgnoredPreviousPatchWarning;
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
