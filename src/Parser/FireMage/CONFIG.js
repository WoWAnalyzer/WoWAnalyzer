import React from 'react';

import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

import FyrunaAvatar from './Images/Fyruna_avatar.jpg';

export default {
  spec: SPECS.FIRE_MAGE,
  maintainer: '@Fyruna',
  maintainerAvatar: FyrunaAvatar,
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  changelog: CHANGELOG,
  description: (
    <div>
      I have been playing Fire throughout most of Nighthold and Tomb of Sargeras, but one of my guildies on Draenor (EU) has stuck with Fire every since vanilla and is my usual source for theories and knowledge. <br/><br/>
      Also the game doesn't want me to have the Sun King bracers.
    </div>
  ),
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/519',
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
