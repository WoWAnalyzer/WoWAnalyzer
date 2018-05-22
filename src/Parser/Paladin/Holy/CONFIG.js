import React from 'react';

import { Zerotorescue } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [Zerotorescue],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.0.0',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      Hey! The Holy Paladin analyzer is one of the most maintained specs on the site. It gets updated quickly with new things, and has most things implemented that can be analyzed automatically with good enough accuracy. If you think anything is off or wrong, please contact me @Zerotorescue so we can discuss it. I don't mind double or triple checking something if there's any doubt.<br /><br />

      I hope the suggestions will help you improve your performance. Remember: focus on improving only one or two important things at a time. Improving isn't easy and will need your full focus until it becomes second nature to you.<br /><br />

      You might have noticed the suggestions focus mostly on improving your cast efficiencies. This might seem silly, but it's actually one of the most important things for us Holy Paladins. Avoid having your <SpellLink id={SPELLS.AVENGING_WRATH.id} /> and other cooldowns available unused for long periods of time (they're not raid cooldowns, they're required for you to have decent throughput and not run OOM) and <b>hit those buttons</b> that have short cooldowns (such as <SpellLink id={SPELLS.HOLY_SHOCK_CAST.id} /> and <SpellLink id={SPELLS.LIGHT_OF_DAWN_CAST.id} />). Ohh and don't cast <SpellLink id={SPELLS.LIGHT_OF_THE_MARTYR.id} /> unless there's nothing else to cast.<br /><br />

      If you want to learn more about Holy Paladins, join the Paladin community at the <a href="https://discordapp.com/invite/hammerofwrath" target="_blank" rel="noopener noreferrer">Hammer of Wrath discord</a>. The <kbd>#holy-faq</kbd> channel has a lot of useful information including links to good guides.
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.HOLY_PALADIN,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "Paladin" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
