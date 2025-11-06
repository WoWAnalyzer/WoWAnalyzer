import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
// import CHANGELOG from './CHANGELOG';
import { Anty, SamuelMaverick, Dboisvert } from 'CONTRIBUTORS';
import Config, { SupportLevel } from 'parser/Config';
import AlertWarning from 'interface/AlertWarning';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Anty, SamuelMaverick, Dboisvert],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.1.5',
  supportLevel: SupportLevel.MaintainedPartial,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      <strong>Welcome, Subtlety Rogues!</strong> <br /> <br />
      This module is still a work in progress. It currently provides a solid analysis of the
      single-target rotation and highlights major mistakes. However, some aspects may still need
      improvement or further tuning.
      <br /> <br />
      The recommendations and analysis are based on{' '}
      <a href="https://www.wowhead.com/guide/classes/rogue/subtlety/overview-pve-dps">WoWhead</a>
      <br /> <br />
      For additional insights on talents, gear, and playstyle, check out{' '}
      <a href="https://www.icy-veins.com/wow/subtlety-rogue-pve-dps-guide">Icy Veins</a>.
      <br /> <br />
      If you notice any inaccuracies, missing data, or have suggestions, please report them on{' '}
      <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or reach out to us
      on Discord.
      <br />
    </>
  ),
  pages: {
    overview: {
      notes: (
        <AlertWarning>
          This analysis is a Work in Progress. I have made some initial updates for Rupture uptime,
          Shadow Dance usage, and Secret Technique tracking, but there is more to do. Apologies for
          the delays, I promise I am working on it. <code>@SamuelMaverick</code>
        </AlertWarning>
      ),
    },
  },
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/hfNtY6RbxWZHM2cL/1-Mythic++Priory+of+the+Sacred+Flame+-+Kill+(27:44)/Quietstep/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.SUBTLETY_ROGUE,
  // The contents of your changelog.
  changelog: [], // CHANGELOG,

  // The CombatLogParser class for your spec.
  // parser: () =>
  //   import('./CombatLogParser' /* webpackChunkName: "SubtletyRogue" */).then(
  //     (exports) => exports.default,
  //   ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
