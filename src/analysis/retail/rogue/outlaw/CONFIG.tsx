import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import { AlertWarning } from 'interface';
import { Anty } from 'CONTRIBUTORS';

import CHANGELOG from './CHANGELOG';
import Config, { SupportLevel } from 'parser/Config';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Anty],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.0.2',
  supportLevel: SupportLevel.MaintainedPartial,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hey Outlaw Rogues! <br /> <br />
      <AlertWarning>
        The Outlaw Rogue module is still being worked on. Currently, it gives a good analysis of the
        single target rotation, and highlights major mistakes.
      </AlertWarning>
      <br /> <br />
      If there is something missing, incorrect, or inaccurate, please report it on{' '}
      <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or contact{' '}
      <kbd></kbd> on Discord.
      <br />
      <br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/t27zV8NLgPvJq3Kk/17-Mythic+Terros+-+Kill+(5:47)/Zirëael/standard/overview',
  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.OUTLAW_ROGUE,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "OutlawRogue" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
