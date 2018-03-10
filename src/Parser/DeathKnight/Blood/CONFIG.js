import React from 'react';

import { Yajinni } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import Wrapper from 'common/Wrapper';
import Warning from 'common/Alert/Warning';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.BLOOD_DEATH_KNIGHT,
  maintainers: [Yajinni],
  patchCompatibility: '7.3.5',
  description: (
    <Wrapper>
      Welcome to the Blood Death Knight analyzer! We hope you find these suggestions and statistics useful.<br /><br />

      <Warning>
        This spec's analysis isn't complete yet. What we do show should be good to use, but it does not show the complete picture.<br />
        If there is something missing, incorrect, or inaccurate, please report it on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or contact us on <a href="https://discord.gg/AxphPxU">Discord</a>.
      </Warning>
    </Wrapper>
  ),
  // exampleReport: '/report/72t9vbcAqdpVRfBQ/12-Mythic+Garothi+Worldbreaker+-+Kill+(6:15)/Maxweii',

  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
