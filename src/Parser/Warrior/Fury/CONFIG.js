import React from 'react';

import { Maldark } from 'MAINTAINERS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FURY_WARRIOR,
  
  maintainers: [Maldark],
  description: (
    <div>
      The Fury Warrior parser only holds very basic functionality. Currently does not analyze legendaries, cast sequence or tier bonuses.
      </div>
  ),
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/milestone/13',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
