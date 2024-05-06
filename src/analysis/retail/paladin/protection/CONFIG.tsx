import TALENTS from 'common/TALENTS/paladin';
import { emallson, Hordehobbs, Heisenburger, Woliance } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import { AlertWarning } from 'interface';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [emallson, Hordehobbs, Heisenburger, Woliance],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: null,
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello, and welcome to the Protection Paladin Analyzer! This analyzer is maintained by{' '}
      <a href="//raider.io/characters/us/arthas/Akromah">
        <code>emallson</code>
      </a>
      , a Brewmaster main and Paladin fan, with assistance from the Protection theorycraft team.
      <br />
      <br />
      If you are new to the spec, focus first on hitting the targets in the Checklist and
      Suggestions tabs. The statistics below provide further insight both into your performance and
      into the effectiveness of your gear and stats.
      <br />
      <br />
      If you have questions about the output, please ask in the <code>
        #protection-questions
      </code>{' '}
      channel of the <a href="https://discord.gg/0dvRDgpa5xZHFfnD">Hammer of Wrath</a>. If you have
      theorycrafting questions or want to contribute, feel free to ask in <code>#protection</code>.
      <br />
      <br />
      <AlertWarning>
        Because <SpellLink spell={TALENTS.GRAND_CRUSADER_TALENT} />{' '}
        <TooltipElement content="The combatlog does not contain any events for random cooldown resets.">
          can't be tracked
        </TooltipElement>{' '}
        properly, any cooldown information of <SpellLink spell={TALENTS.AVENGERS_SHIELD_TALENT} />{' '}
        should be treated as{' '}
        <TooltipElement content="Whenever Avenger's Shield would be cast before its cooldown would have expired normally, the cooldown expiry will be set back to the last possible trigger of Grand Crusade. This may lead to higher times on cooldown than you actually experienced in-game.">
          educated guesses
        </TooltipElement>
        .
      </AlertWarning>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/bdf9wjm7XJQn3DCR/31-Mythic+The+Council+of+Blood+-+Wipe+15+(4:38)/Welenstus',
  guideDefault: true,
  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.PROTECTION_PALADIN,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ProtectionPaladin" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};
