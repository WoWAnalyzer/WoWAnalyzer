import React from 'react';
import SPECS from 'game/SPECS';
import Config from 'parser/Config';

import { Putro } from 'CONTRIBUTORS';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Putro],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '9.0.2',
  // If set to  false`, the spec will show up as unsupported.
  isSupported: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello and welcome to the Marksmanship Hunter analyzer! We hope that the suggestions and statistics will be helpful in improving your overall performance. Try and focus on improving only a few things at a time, until those become ingrained in your muscle memory so as to not be concentrating on many different things.
      <br />
      <br />
      If you want to learn more about Marksmanship Hunters, join the Hunter community on the Trueshot Lodge Discord: <a href="https://www.discord.gg/trueshot" target="_blank" rel="noopener noreferrer">discord.gg/trueshot</a>. The <kbd>#Marksmanship</kbd> channel has a lot of helpful people, and if you post your logs in <kbd>#log-reviews</kbd>, you can expect to get some good pointers for improvement from the community. The best guide available currently is the guide on <a href="https://www.icy-veins.com/wow/marksmanship-hunter-pve-dps-guide">Icy-veins</a>. It is maintained by Azortharion, and it is constantly fact-checked by community-members, and improved upon on an almost weekly basis.
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/qbwPzJ6QDkamCdKR/10-Heroic+Hungering+Destroyer+-+Kill+(4:43)/Blindsite',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.MARKSMANSHIP_HUNTER,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "MarksmanshipHunter" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};

export default config;
