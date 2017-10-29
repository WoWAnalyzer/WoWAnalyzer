import React from 'react';

import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

import SharrqAvatar from './Images/Sharrq_avatar.jpg';

export default {
  spec: SPECS.FROST_MAGE,
  maintainer: '@Sharrq and @sref',
  maintainerAvatar: SharrqAvatar,
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  changelog: CHANGELOG,
  description: (
    <div>
      Hello Everyone! First things first I am by no means a theorycrafter or expert in all things mages, but my mage has been my main ever since Burning Crusade and I have a pretty good idea of how things work. <br /> <br />
	  Additionally I am not a pro when it comes to programming these modules and analysis. So if something is missing that you think should be added, you run into an issue with something i made, or if you make a module that you think should be added, please send it to me! <br /> <br />
    </div>
  ),
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/467',
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
