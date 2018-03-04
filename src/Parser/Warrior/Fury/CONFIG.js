import React from 'react';

import { Maldark } from 'MAINTAINERS';
import Wrapper from 'common/Wrapper';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FURY_WARRIOR,
  
  maintainers: [Maldark],
  description: (
    <Wrapper>
      Hey there! Right now the Fury Warrior parser only holds very basic functionality. It does not yet analyze legendaries, cast sequence or tier bonuses. What we do show should be good to use, but it does not show the complete picture.
    </Wrapper>
  ),

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
