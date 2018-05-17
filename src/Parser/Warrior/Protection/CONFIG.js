import React from 'react';

import { Salarissia, joshinator } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';
import Warning from 'common/Alert/Warning';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [Salarissia, joshinator],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3.5',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      <Warning>
        Hey there! Right now the Protection Warrior parser only holds very basic functionality. What we do show should be good to use, but it does not show the complete picture.<br />
        If there is something missing, incorrect, or inaccurate, please report it on <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or contact us on <a href="https://discord.gg/AxphPxU">Discord</a>.
      </Warning>
      <Warning>
        Because resets of <SpellLink id={SPELLS.SHIELD_SLAM.id} /> <dfn data-tip="The combatlog does not contain any events for random cooldown resets.">can't be tracked</dfn> properly, any cooldown information of <SpellLink id={SPELLS.SHIELD_SLAM.id} /> should be treated as <dfn data-tip="Whenever Shield Slams would be cast before its cooldown would have expired normally, the cooldown expiry will be set back to the last possible trigger of Revenge, Devastate, Devastator or Thunder Clap. This may lead to higher times on cooldown than you actually experienced in-game.">educated guesses</dfn>.
      </Warning>
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  // exampleReport: '/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.PROTECTION_WARRIOR,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "Warrior" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
