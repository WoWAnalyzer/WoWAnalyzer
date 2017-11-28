import { Mamtooth } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.HAVOC_DEMON_HUNTER,
  maintainers: [Mamtooth],
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK, // good = it matches most common manual reviews in class discords, great = it support all important class features
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
