import React from 'react';

import { Anomoly } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [Anomoly],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3.5',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      Hello all! Thanks so much for taking the time use this tool as a way to improve your play. The goal is to provide targeted suggestions to improve your overall Mistweaver Monk play. The suggestions are based on the current theorycrafting and practical knowledge from some of the best Mistweavers playing this game. (And even some former mistweavers who still like to help us dreamers out.) <br /> <br />

      The tool is not perfect so I am always looking to improve it. If you have any suggestions or comments, don't hesitated to swing by the GitHub Issue linked below, or the <a href="https://discord.gg/0dkfBMAxzTkWj21F" target="_blank" rel="noopener noreferrer">Peak of Serenity</a> discord server. You can also contact me directly on either BattleNet (Anomoly#1464) or Discord (Anomoly#6931). Thanks and I hope you continue to enjoy the tool!
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  // exampleReport: '/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.MISTWEAVER_MONK,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: CombatLogParser,
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
