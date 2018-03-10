import React from 'react';

import { Putro } from 'MAINTAINERS';
import SPECS from 'common/SPECS';
import Wrapper from 'common/Wrapper';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.BEAST_MASTERY_HUNTER,
  maintainers: [Putro],
  patchCompatibility: '7.3.5',
  description: (
    <Wrapper>
      Hey, I am working on making this analyzer as good as I can. I hope that the suggestions that will be implemented in the future, will be helpful in aiding you improve your overall performance.<br /><br />

      If you want to learn more about Beast Mastery Hunters, join the Hunter community on the Trueshot Lodge discord: <a href="https://discordapp.com/invite/trueshot" target="_blank" rel="noopener noreferrer">https://discordapp.com/invite/trueshot</a>. The <kbd>#beast-mastery</kbd> channel has a lot of helpful people, and if you post your logs in <kbd>#log-reviews</kbd>, you can expect to get some good pointers for improvement from the community. The best guide available currently is the guide on <a href="https://www.icy-veins.com/wow/beast-mastery-hunter-pve-dps-guide">Icy-veins</a>. It is maintained by Azortharion, one of the best hunters in the world, and it is constantly fact-checked by community-members, and improved upon on an almost weekly basis.
    </Wrapper>
  ),
  exampleReport: '/report/hxzFPBaWLJrG1NQR/24-Heroic+Imonar+the+Soulhunter+-+Kill+(3:38)/Putro',

  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
