import React from 'react';

import { Khazak, Bicepspump } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import Wrapper from 'common/Wrapper';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.UNHOLY_DEATH_KNIGHT,
  maintainers: [Khazak, Bicepspump],
  patchCompatibility: '7.3.5',
  description: (
    <Wrapper>
      Welcome to the Unholy Death Knight analyzer! We hope you find these suggestions and statistics useful.
    </Wrapper>
  ),
  exampleReport: '/report/72t9vbcAqdpVRfBQ/12-Mythic+Garothi+Worldbreaker+-+Kill+(6:15)/Maxweii',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
