import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import { SebShady } from 'CONTRIBUTORS';

import CHANGELOG from './CHANGELOG';
import Config, { SupportLevel } from 'parser/Config';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [SebShady],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.0.2',
  supportLevel: SupportLevel.MaintainedPartial,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hey Assassination Rogues! <br /> <br />
      If you want to learn more about Assassination, head over to{' '}
      <a
        href="https://www.wowhead.com/guide/classes/rogue/assassination/overview-pve-dps"
        target="_blank"
        rel="noopener noreferrer"
      >
        Wowhead
      </a>
      , or check out{' '}
      <a
        href="https://www.icy-veins.com/wow/assassination-rogue-pve-dps-guide"
        target="_blank"
        rel="noopener noreferrer"
      >
        Icy-veins
      </a>
      to learn more about talents, gear and tips .
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/qgQGvkm6ydHbpLaX/94-Mythic+Kazzara,+the+Hellforged+-+Kill+(5:08)/Whíspyr/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.ASSASSINATION_ROGUE,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "AssassinationRogue" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
