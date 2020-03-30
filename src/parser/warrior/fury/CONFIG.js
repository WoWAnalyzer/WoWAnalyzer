import React from 'react';

import {Abelito75 } from 'CONTRIBUTORS';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Abelito75],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.3',
  // If set to  false`, the spec will show up as unsupported.
  isSupported: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      While most features for Fury have been implemented, there are a few that are still to come. If you find any issues or if there is something missing that you would like to see added, please open an Issue on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or send a message to Abelito75 on Discord (Abelito75#0001). <br /> <br />

      Make sure to check out the <a href="https://discordapp.com/invite/Skyhold">Warrior Class Discord</a> if you need more specific advice or a more detailed guide than the ones available on <a href="https://www.icy-veins.com/wow/fury-warrior-pve-dps-guide">Icy-Veins</a> and <a href="https://www.wowhead.com/fury-warrior-guide">Wowhead</a>.<br /><br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/TGzmk4bXDZJndpj7/6-Heroic+Opulence+-+Kill+(8:12)/11-Zahnbone',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.FURY_WARRIOR,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "FuryWarrior" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
