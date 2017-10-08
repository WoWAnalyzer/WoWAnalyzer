import React from 'react';

import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

import SharrqAvatar from './Images/Sharrq_avatar.jpg';

export default {
  spec: SPECS.FROST_MAGE,
  maintainer: '@Sharrq',
  maintainerAvatar: SharrqAvatar,
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  changelog: CHANGELOG,
  description: (
    <div>
      Work in Progress
    </div>
  ),
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/259',
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
