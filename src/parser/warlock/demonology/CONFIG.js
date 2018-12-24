import React from 'react';

import { Chizu } from 'CONTRIBUTORS';
import retryingPromise from 'common/retryingPromise';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Chizu],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.1',
  // If set to  false`, the spec will show up as unsupported.
  isSupported: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello fellow Netherlords! Currently this spec is still in development by me with help of <strong>Motoko</strong> from Warlock Discord. Stay tuned, features will be added over time.<br /> <br />

      If you have any questions about Warlocks, feel free to pay a visit to <a href="https://discord.gg/BlackHarvest" target="_blank" rel="noopener noreferrer">Council of the Black Harvest Discord</a> or <a href="https://lockonestopshop.com" target="_blank" rel="noopener noreferrer">Lock One Stop Shop</a>, if you'd like to discuss anything about this analyzer, message me at @Chizu#2873 on WoWAnalyzer Discord.<br /><br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/hMn6w8afHVDLgFBZ/11-Heroic+Vectis+-+Kill+(6:45)/14-Sharora',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.DEMONOLOGY_WARLOCK,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => retryingPromise(() => import('./CombatLogParser' /* webpackChunkName: "DemonologyWarlock" */).then(exports => exports.default)),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
