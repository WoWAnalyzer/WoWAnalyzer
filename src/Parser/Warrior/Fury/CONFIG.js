import React from 'react';

import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FURY_WARRIOR,
  // TODO: Make maintainer an array
  maintainer: '@Maldark',
  description: (
    <div>
      Implemented out of necessity, shared because sharing is indeed caring
    </div>
  ),
  // When changing this please make a PR with ONLY this value changed, we will do a review of your analysis to find out of it is complete enough.
  completeness: SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED,
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/milestone/13',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
