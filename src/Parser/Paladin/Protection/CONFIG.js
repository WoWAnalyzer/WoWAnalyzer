import React from 'react';

import { Hewhosmites, Noichxd, Yajinni, Zerotorescue } from 'CONTRIBUTORS';
import SPECS from 'common/SPECS';
import Warning from 'common/Alert/Warning';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list.
  contributors: [Yajinni, Noichxd, Hewhosmites, Zerotorescue],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3',
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <React.Fragment>
      <Warning>
        Hey there! Right now the Protection Paladin parser only holds very basic functionality. What we do show should be good to use, but it does not show the complete picture.
      </Warning>

      <Warning>
        Because <SpellLink id={SPELLS.GRAND_CRUSADER.id} /> <dfn data-tip="The combatlog does not contain any events for random cooldown resets.">can't be tracked</dfn> properly, any cooldown information of <SpellLink id={SPELLS.AVENGERS_SHIELD.id} /> should be treated as <dfn data-tip="Whenever Avenger's Shield would be cast before its cooldown would have expired normally, the cooldown expiry will be set back to the last possible trigger of Grand Crusade. This may lead to higher times on cooldown than you actually experienced in-game.">educated guesses</dfn>.
      </Warning>
    </React.Fragment>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  // exampleReport: '/report/hNqbFwd7Mx3G1KnZ/18-Mythic+Antoran+High+Command+-+Kill+(6:51)/Taffly',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.PROTECTION_PALADIN,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "Paladin" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
