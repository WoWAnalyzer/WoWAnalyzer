import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

import ZerotorescueAvatar from './Images/zerotorescue-avatar.png';

export default {
  spec: SPECS.HOLY_PALADIN,
  // TODO: Make maintainer an array
  maintainer: '@Zerotorescue',
  maintainerAvatar: ZerotorescueAvatar,
  completeness: SPEC_ANALYSIS_COMPLETENESS.GREAT, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  changelog: CHANGELOG,
  parser: CombatLogParser,
};
