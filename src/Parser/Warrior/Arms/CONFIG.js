import React from 'react';

import { TheBadBossy } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.ARMS_WARRIOR,
  maintainers: [TheBadBossy],
  description: (
    <Wrapper>
      Hey I've been hard at work making this analyzer for you. I hope the suggestions give you useful pointers to improve your performance. Remember: focus on improving only one or two important things at a time. Improving isn't easy and will need your full focus until it becomes second nature to you.
    </Wrapper>
  ),

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
