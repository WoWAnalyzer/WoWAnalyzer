import React from 'react';

import { Thieseract } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import Warning from 'common/Alert/Warning';
import Wrapper from 'common/Wrapper';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FERAL_DRUID,
  maintainers: [Thieseract],
  patchCompatibility: '7.3.5',
  description: (
    <Wrapper>
      Questions about Feral? Visit <a href="http://www.discord.me/Dreamgrove">Dreamgrove</a> Discord.<br /><br />

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
