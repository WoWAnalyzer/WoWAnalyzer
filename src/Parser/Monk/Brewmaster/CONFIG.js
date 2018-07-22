import React from 'react';

import { emallson } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [emallson],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.0.1',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      Hello, and welcome to the Brewmaster Analyzer! This analyzer is maintained by <a href="//raider.io/characters/us/arthas/Eisenpelz"><code>emallson</code></a>, and there are currently no known issues.<br/>

      If you have questions about the output, please ask in the <code>#brew_questions</code> channel of the <a href="http://discord.gg/peakofserenity">Peak of Serenity</a>. If you have theorycrafting questions or want to contribute, come say hi in <code>#craft-brewing</code>.
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/DYjprw1mTt4Gxnb9/13-Mythic+Argus+the+Unmaker+-+Kill+(8:23)/2-Pumpsx',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.BREWMASTER_MONK,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "Monk" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
