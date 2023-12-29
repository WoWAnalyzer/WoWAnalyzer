import SPELLS from 'common/SPELLS';
import { Abelito75 } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import { AlertWarning, SpellLink, TooltipElement } from 'interface';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const CONFIG: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Abelito75],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: null,
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello all! Thanks so much for taking the time use this tool as a way to improve your play. The
      goal is to provide targeted suggestions to improve your overall Protection Warrior play. The
      suggestions are based on the current theorycrafting and practical knowledge from some of the
      best Protection Warrior playing this game. (And even some former Protection Warrior who still
      like to help us dreamers out.) <br /> <br />
      The tool is not perfect so I am always looking to improve it. If you have any suggestions or
      comments, don't hesitated to swing by the GitHub Issue linked below, or the{' '}
      <a href="https://discord.gg/0pYY7932lTH4FHW6" target="_blank" rel="noopener noreferrer">
        Skyhold
      </a>{' '}
      discord server. Thanks and I hope you continue to enjoy the tool!
      <AlertWarning>
        Because resets of <SpellLink spell={SPELLS.SHIELD_SLAM} />{' '}
        <TooltipElement content="The combatlog does not contain any events for random cooldown resets.">
          can't be tracked
        </TooltipElement>{' '}
        properly, any cooldown information of <SpellLink spell={SPELLS.SHIELD_SLAM} /> should be
        treated as{' '}
        <TooltipElement content="Whenever Shield Slams would be cast before its cooldown would have expired normally, the cooldown expiry will be set back to the last possible trigger of Revenge, Devastate, Devastator or Thunder Clap. This may lead to higher times on cooldown than you actually experienced in-game.">
          educated guesses
        </TooltipElement>
        .
      </AlertWarning>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/471LzwXpgtPTJGaq/31-Mythic+Rashok,+the+Elder+-+Kill+(5:50)/Sense/standard/overview',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.PROTECTION_WARRIOR,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ProtectionWarrior" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};
export default CONFIG;
