import React from 'react';

import { Hartra344, Versaya } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import Warning from 'common/Alert/Warning';
import Wrapper from 'common/Wrapper';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.RESTORATION_SHAMAN,
  maintainers: [Hartra344, Versaya],
  patchCompatibility: '7.3.5',
  description: (
    <Wrapper>
      Welcome to the Resto Shaman analyzer! We hope you find these suggestions and statistics useful.<br /><br />

      If you want to learn more about Resto Shaman, join the Resto Shaman community at the <a href="https://discord.gg/AcTek6e" target="_blank" rel="noopener noreferrer">Ancestral Guidance channel</a>.<br /><br />

      <Warning>
        This spec's analysis isn't complete yet. What we do show should be good to use, but it does not show the complete picture.<br />
        If there is something missing, incorrect, or inaccurate, please report it on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or contact us on <a href="https://discord.gg/AxphPxU">Discord</a>.
      </Warning>
    </Wrapper>
  ),
  // exampleReport: '/report/72t9vbcAqdpVRfBQ/12-Mythic+Garothi+Worldbreaker+-+Kill+(6:15)/Maxweii',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
