import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import { Vollmer } from 'CONTRIBUTORS';

// import CHANGELOG from './CHANGELOG';
import Config, { SupportLevel } from 'parser/Config';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Vollmer],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.1.0',
  supportLevel: SupportLevel.MaintainedPartial,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      <p>
        <strong>Hey Outlaw Rogues!</strong>
      </p>
      <p>
        This module is still a work in progress. It currently provides a solid analysis of the
        single-target rotation and highlights major mistakes. However, some aspects may still need
        improvement or further tuning.
      </p>
      <p>
        The recommendations and analysis are based on{' '}
        <a href="https://www.wowhead.com/guide/classes/rogue/outlaw/rotation-cooldowns-pve-dp">
          WoWhead
        </a>
      </p>
      <p>
        If there is something missing, incorrect, or inaccurate, please report it on{' '}
        <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or reach out to
        us on Discord.
      </p>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/rjcWD3NgPtMaf6Qb/2-Mythic+One-Armed+Bandit+-+Kill+(6:47)/Sjakal/standard/overview',
  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.OUTLAW_ROGUE,
  // The contents of your changelog.
  changelog: [], // CHANGELOG,
  // The CombatLogParser class for your spec.
  // parser: () =>
  //   import('./CombatLogParser' /* webpackChunkName: "OutlawRogue" */).then(
  //     (exports) => exports.default,
  //   ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
