/* eslint-disable @typescript-eslint/no-var-requires */
import { CharactersByIdState } from 'interface/reducers/charactersById';
import { CombatantsState } from 'interface/reducers/combatants';
import { LanguageState } from 'interface/reducers/language';
import { ModalState } from 'interface/reducers/openModals';
import { ReportState } from 'interface/reducers/report';
import { ReportCodesIgnoredPreviousPatchWarning } from 'interface/reducers/reportCodesIgnoredPreviousPatchWarning';
import { SpecsIgnoredNotSupportedWarningState } from 'interface/reducers/specsIgnoredNotSupportedWarning';
import { combineReducers } from 'redux';
import { InternetExplorerState } from 'interface/reducers/internetExplorer';

export interface RootState {
  internetExplorer: InternetExplorerState;
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

const createReducers = () =>
  combineReducers({
    // System
    internetExplorer: require('./internetExplorer').default,

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
    reportCodesIgnoredPreviousPatchWarning: require('./reportCodesIgnoredPreviousPatchWarning')
      .default,
  });

export default createReducers;
