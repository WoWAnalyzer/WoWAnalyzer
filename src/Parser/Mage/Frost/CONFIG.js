import React from 'react';

import { Sharrq, sref } from 'MAINTAINERS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FROST_MAGE,
  maintainers: [Sharrq, sref],
  changelog: CHANGELOG,
  description: (
    <div>
      Hello Everyone! We are always looking to improve the Frost Mage Analyzers and Modules; so if you find any issues or if there is something missing that you would like to see added, please open an Issue on GitHub or send a message to us on Discord (Sharrq#7530 or Sref#3865) <br /> <br />
	    Additionally, if you need further assistance in improving your gameplay as a Frost Mage, you can refer to the following resources:<br />
      <a href="https://discord.gg/0gLMHikX2aZ23VdA" target="_blank" rel="noopener noreferrer">Mage Class Discord</a> <br />
      <a href="https://www.altered-time.com/forum/" target="_blank" rel="noopener noreferrer">Altered Time (Mage Forums/Guides)</a> <br />
      <a href="https://www.icy-veins.com/wow/frost-mage-pve-dps-guide" target="_blank" rel="noopener noreferrer">Icy Veins (Frost Mage Guide)</a> <br/>
    </div>
  ),
  specDiscussionUrl: 'https://github.com/WoWAnalyzer/WoWAnalyzer/milestone/3',
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
