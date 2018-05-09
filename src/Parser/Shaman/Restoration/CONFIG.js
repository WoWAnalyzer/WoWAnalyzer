import React from 'react';

import { Hartra344, Versaya, niseko } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';
import Warning from 'common/Alert/Warning';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [Hartra344, Versaya, niseko],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.0.0',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      Welcome to the Resto Shaman analyzer! We hope you find these suggestions and statistics useful.<br /><br />

      If you want to learn more about Resto Shaman, join the Resto Shaman community at the <a href="https://discord.gg/AcTek6e" target="_blank" rel="noopener noreferrer">Ancestral Guidance</a> discord server and make sure to visit the <a href="https://ancestralguidance.com/">website</a>.<br /><br />

      <Warning>
        If there is something missing, incorrect, or inaccurate, please report it on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or contact us on <a href="https://discord.gg/AxphPxU">Discord</a>.
      </Warning>
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  // exampleReport: '/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.RESTORATION_SHAMAN,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "Shaman" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
