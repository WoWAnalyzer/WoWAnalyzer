import React from 'react';

import { Juko8, Skeletor } from 'CONTRIBUTORS';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Juko8, Skeletor],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.3',
  // If set to  false`, the spec will show up as unsupported.
  isSupported: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
  	<>
  		We hope you get some use out this analyzer we have been working on.<br /><br />

  		The best general piece of advice is to ensure you're keeping your abilities on CD and not wasting Holy Power.<br /><br />

  		If you want to learn more about Retribution Paladins make sure to also check out the <a href="https://discordapp.com/invite/hammerofwrath" target="_blank" rel="noopener noreferrer">Hammer of Wrath Paladin Discord</a>. The <kbd>#ret-faq</kbd> channel has some useful guides and the <kbd>#ret-general</kbd> has lots of memes if you're into that.<br /><br />

      In-depth guides are available at <a href="https://www.retpaladin.xyz/ret-paladin-8-1-0-pve-guide/">RetPaladin.XYZ</a>, <a href="https://www.wowhead.com/retribution-paladin-guide">Wowhead</a>, and <a href="http://www.icy-veins.com/wow/retribution-paladin-pve-dps-guide">Icy Veins</a>. These guides also feature encounter specific tips to help you improve. Look for them in the navigation bar/panels.<br /><br />

  		Feel free to message us on discord or on GitHub with any bugs or ideas for things we could work on!
  	</>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/BYXDCHGQyc3L98at/18-Mythic+Lady+Ashvane+-+Kill+(3:47)/Cellendis',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.RETRIBUTION_PALADIN,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "RetributionPaladin" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
