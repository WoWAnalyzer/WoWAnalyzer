import { MyHandle } from 'MAINTAINERS';

import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.MY_NEW_SPEC,
  maintainers: [MyHandle],
  // good = it matches most common manual reviews in class discords, great = it support all important class features
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK,
  // TODO: specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/milestone/2',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
