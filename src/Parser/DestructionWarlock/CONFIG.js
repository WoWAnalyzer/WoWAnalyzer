import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

import ChizuAvatar from './Images/Chizu_avatar.jpg';

export default {
  spec: SPECS.DESTRUCTION_WARLOCK,
  maintainer: '@Chizu',
  maintainerAvatar: ChizuAvatar,
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  changelog: CHANGELOG,
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/259',
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
