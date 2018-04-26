import React from 'react';

import { Juko8 } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [Juko8],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3.5',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      Hello! We have been working hard to make the Windwalker analyzer good, but there is always stuff to add or improve. We hope that the suggestions and statistics will be helpful in improving your overall performance. It takes time to learn the Windwalker resource and cooldown management, so be patient with yourself while getting used to it. <br /> <br />

      If you have any questions about the analyzer or Windwalker monks in general, join us in the <a href="https://discord.gg/0dkfBMAxzTkWj21F" target="_blank" rel="noopener noreferrer">Peak of Serenity discord server</a> and talk to us. You can reach me there as Juko8. Make sure to also check out our resources on the <a href="http://peakofserenity.com/windwalker/">Peak of Serenity website</a> as well, it has pretty much everything you need to know.
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  // exampleReport: '/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.WINDWALKER_MONK,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "Monk" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
