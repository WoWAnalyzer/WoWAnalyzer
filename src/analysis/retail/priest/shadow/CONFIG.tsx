import { DoxAshe } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [DoxAshe],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.0.2',
  supportLevel: SupportLevel.MaintainedPartial,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Welcome to the Shadow Priest analyzer! We hope you find these suggestions and statistics
      useful. If you find any issues, please let DoxAshe#8269 know on Discord
      <br />
      <br />
      If you need general help learning the spec, Wowhead has a great getting started guide for
      Shadow. You can find it{' '}
      <a
        href="https://www.wowhead.com/shadow-priest-guide"
        target="_blank"
        rel="noopener noreferrer"
      >
        here
      </a>
      .<br />
      <br />
      If you have any questions about playing Shadow Priest, join the Priest community at the{' '}
      <a href="https://discord.gg/WarcraftPriests" target="_blank" rel="noopener noreferrer">
        Warcraft Priests discord channel
      </a>
      .
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    'report/tnNGvpWfbJ1wZdTX/12-Heroic+Ulgrax+the+Devourer+-+Kill+(7:36)/Doxashe/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.SHADOW_PRIEST,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ShadowPriest" */).then(
      (exports) => exports.default,
    ),
  //The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
