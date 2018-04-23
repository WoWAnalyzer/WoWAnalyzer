import React from 'react';

import { Sharrq, sref } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [Sharrq, sref],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3.5',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more. If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      Hello Everyone! We are always looking to improve the Frost Mage Analyzers and Modules; so if you find any issues or if there is something missing that you would like to see added, please open an Issue on GitHub or send a message to us on Discord (Sharrq#7530 or Sref#3865) <br /><br />

	    Additionally, if you need further assistance in improving your gameplay as a Frost Mage, you can refer to the following resources:<br />
      <a href="https://discord.gg/0gLMHikX2aZ23VdA" target="_blank" rel="noopener noreferrer">Mage Class Discord</a> <br />
      <a href="https://www.altered-time.com/forum/" target="_blank" rel="noopener noreferrer">Altered Time (Mage Forums/Guides)</a> <br />
      <a href="https://www.icy-veins.com/wow/frost-mage-pve-dps-guide" target="_blank" rel="noopener noreferrer">Icy Veins (Frost Mage Guide)</a>
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/t3wKdDkB7fZqbmWz/1-Normal+Garothi+Worldbreaker+-+Kill+(4:24)/Sref',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.FROST_MAGE,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: CombatLogParser,
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
