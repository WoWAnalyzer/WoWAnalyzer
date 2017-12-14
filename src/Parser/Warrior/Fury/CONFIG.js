import React from 'react';

import { Maldark } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import SPEC_ANALYSIS_COMPLETENESS from 'common/SPEC_ANALYSIS_COMPLETENESS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FURY_WARRIOR,
  
  maintainers: [Maldark],
  description: (
    <div>
      The Fury Warrior parser only holds very basic functionality. Does not analyze legendaries, cast sequence or tier bonuses.
      </div>
  ),
  // good = it matches most common manual reviews in class discords, great = it support all important class features
  completeness: SPEC_ANALYSIS_COMPLETENESS.NOT_ACTIVELY_MAINTAINED,
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/milestone/13',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
