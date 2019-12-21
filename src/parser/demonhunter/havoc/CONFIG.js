import React from 'react';

import { Mamtooth, Yajinni } from 'CONTRIBUTORS';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Mamtooth, Yajinni],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.1.5',
  // If set to  false`, the spec will show up as unsupported.
  isSupported: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Welcome to the Havoc Demon Hunter analyzer! We hope you find these suggestions and statistics useful.<br />
      <br />More resources for Havoc:<br />
      <a href="https://discord.gg/zGGkNGC" target="_blank" rel="noopener noreferrer">Demon Hunter Class Discord</a> <br />
      <a href="https://www.wowhead.com/havoc-demon-hunter-guide" target="_blank" rel="noopener noreferrer">Wowhead Guide</a> <br />
      <a href="https://www.icy-veins.com/wow/havoc-demon-hunter-pve-dps-guide" target="_blank" rel="noopener noreferrer">Icy Veins Guide</a> <br />

    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/TGzmk4bXDZJndpj7/6-Heroic+Opulence+-+Kill+(8:12)/5-Tarke',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.HAVOC_DEMON_HUNTER,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "HavocDemonHunter" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
