import { Sref } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Sref],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.1.0',
  supportLevel: SupportLevel.MaintainedFull,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      <p>Welcome to the Resto Druid analyzer! We hope you find the guide and statistics useful.</p>
      <p>
        If you questions, comments, or suggestions about this analyzer, you can reach the
        WoWAnalyzer team on{' '}
        <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a>, on{' '}
        <a href="https://discord.gg/AxphPxU">Discord</a>, or message me (
        <a href="/contributor/Sref">Sref</a>) directly on Discord. We're always interested in
        improving the analyzer, whether it's in-depth theorycraft or rewording some text to be
        easier to understand. The whole project is open source and welcomes contributions so you can
        directly improve it too!
      </p>
      <p>
        If you have gameplay questions, check out:
        <ul>
          <li>
            <a href="https://www.wowhead.com/restoration-druid-guide">Resto guide</a> on Wowhead
          </li>
          <li>
            <a href="https://www.dreamgrove.gg/blog/resto/compendium">Resto compendium</a> on
            Dreamgrove.gg
          </li>
          <li>
            <a href="https://discord.gg/dreamgrove" target="_blank" rel="noopener noreferrer">
              Dreamgrove
            </a>{' '}
            - the Druid community Discord
          </li>
        </ul>
      </p>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/dfv4tpJAyVakGFK9/6-Mythic+Smolderon+-+Kill+(3:53)/Nikosux/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.RESTORATION_DRUID,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "RestorationDruid" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
