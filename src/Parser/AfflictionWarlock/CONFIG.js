import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.AFFLICTION_WARLOCK,
  maintainer: '@Chizu',
  completeness: SPEC_ANALYSIS_COMPLETENESS.GOOD, 
  changelog: CHANGELOG,
  parser: CombatLogParser,
};
