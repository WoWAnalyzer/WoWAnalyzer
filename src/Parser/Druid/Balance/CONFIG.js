import React from 'react';

import { Iskalla, Gebuz } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [Gebuz, Iskalla],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3.5',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      Hello Moonkins! This tool is intended to show major statistics and potential issues in your rotation. Please mind that it can always be improved upon, so if you see anything that you disagree with or think is missing please let us know!<br/><br/>

      As a rule of thumb: Never overcap Astral Power, keep your moon spells on cooldown, don't overcap empowerments and keep your dots up on the target(s) at all times. Remember to pool Astral Power prior to movement.<br/><br/>

      If you want to learn more about how to play Moonkin, visit <a href="https://goo.gl/xNHVnK" target="_blank" rel="noopener noreferrer">DreamGrove, the Druid's Discord</a>. Don't forget to check the <kbd>#resources</kbd> channel while you are there!
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  // exampleReport: '/report/72t9vbcAqdpVRfBQ/12-Mythic+Garothi+Worldbreaker+-+Kill+(6:15)/Maxweii',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.BALANCE_DRUID,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "Druid" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
