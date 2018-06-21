import React from 'react';

import { Hewhosmites, Juko8 } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [Hewhosmites, Juko8],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3.5',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
  	<React.Fragment>
  		I hope you get some use out this analyzer I have been working on. It is kind of hard to determine exactly what seperates the okay from the good and the good from the great (other than getting a Retribution proc on the great ones wings). <br /><br />

  		Honestly my biggest take away for you is make sure to not waste any Holy Power and always be casting. <br /><br />

  		If you want to learn more about Retribution Paladins make sure to also check out the Paladin discord: <a href="https://discordapp.com/invite/hammerofwrath" target="_blank" rel="noopener noreferrer">https://discordapp.com/invite/hammerofwrath</a>. The <kbd>#ret-faq</kbd> channel has some useful guides and the <kbd>#ret-discussion</kbd> has lots of memes if you're into that.<br /><br />

  		Feel free to message me on discord or on GitHub with any bugs or ideas for things I could work on!
  	</React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  // exampleReport: '/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.RETRIBUTION_PALADIN,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "Paladin" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
