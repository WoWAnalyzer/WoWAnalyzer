import { WOPR } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.BREWMASTER_MONK,
  maintainers: [WOPR],
  completeness: SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED, // good = it matches most common manual reviews in class discords, great = it support all important class features
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
