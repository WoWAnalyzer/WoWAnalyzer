import React from 'react';

import { Fyruna } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FIRE_MAGE,
  maintainers: [Fyruna],
  completeness: SPEC_ANALYSIS_COMPLETENESS.NEEDS_MORE_WORK, // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  changelog: CHANGELOG,
  description: (
    <div>
      Welcome to the Fire Mage analyzer! We hope you find these suggestions and statistics useful.
      <br /><br />
      If you want to learn more about Fire Mages, join the Mage community at the <a href="https://discord.gg/alteredtime" target="_blank" rel="noopener noreferrer">Altered Time discord channel</a>. You can also check out the <a href="https://www.altered-time.com/forum/viewforum.php?f=4" target="_blank" rel="noopener noreferrer">Altered Time forum, Fire section</a> for spec specific advice. 
    </div>
  ),
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/issues/519',
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
