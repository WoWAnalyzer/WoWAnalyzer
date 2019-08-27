import React from 'react';

import { Abelito75 } from 'CONTRIBUTORS';
import retryingPromise from 'common/retryingPromise';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import SPECS from 'game/SPECS';
import { TooltipElement } from 'common/Tooltip';
import Warning from 'interface/common/Alert/Warning';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Abelito75],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.0',
  // If set to  false`, the spec will show up as unsupported.
  isSupported: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      <Warning>
        Hey there! Right now the Protection Warrior parser is a work in progress and  is nearing completion! More or less everything is in here but not fully tested. Use at your own risk... but if you do find a bug contact us on <a href="https://discord.gg/AxphPxU">Discord</a>.<br />
      </Warning>
      <Warning>
        Because resets of <SpellLink id={SPELLS.SHIELD_SLAM.id} /> <TooltipElement content="The combatlog does not contain any events for random cooldown resets.">can't be tracked</TooltipElement> properly, any cooldown information of <SpellLink id={SPELLS.SHIELD_SLAM.id} /> should be treated as <TooltipElement content="Whenever Shield Slams would be cast before its cooldown would have expired normally, the cooldown expiry will be set back to the last possible trigger of Revenge, Devastate, Devastator or Thunder Clap. This may lead to higher times on cooldown than you actually experienced in-game.">educated guesses</TooltipElement>.
      </Warning>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/fGx9M1rNZWX34ynk/18-Heroic+Grong+-+Kill+(5:21)/3-Areoss',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.PROTECTION_WARRIOR,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => retryingPromise(() => import('./CombatLogParser' /* webpackChunkName: "ProtectionWarrior" */).then(exports => exports.default)),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
