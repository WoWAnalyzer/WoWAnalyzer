import { jazminite, Bhahlou } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import type Config from 'parser/Config';
import CHANGELOG from './CHANGELOG';
import { SupportLevel } from 'parser/Config';

const CONFIG: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [jazminite, Bhahlou],
  branch: GameBranch.Classic,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '4.4.1',
  supportLevel: SupportLevel.MaintainedPartial,
  // You can explain the status of this spec's analysis here by uncommenting the description section if you need a custom message. Otherwise it is covered by the foundation guide.
  description: (
    <>
      <p>
        Welcome to the Demononoly Warlock analyzer! We hope that you will find useful information in
        here!
      </p>
      <p>
        If you have questions, comments, or suggestions about this analyzer, you can reach the
        WoWAnalyzer team on{' '}
        <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a>, on{' '}
        <a href="https://discord.gg/AxphPxU">Discord</a>, or message me (
        <a href="/contributor/Bhahlou">Bhahlou</a>) directly on Discord. We're always interested in
        improving the analyzer, whether it's in-depth theorycrafting or rewording some text to be
        easier to understand. The whole project is open source and welcomes contributions so you can
        directly improve it too!
      </p>
      <p>
        If you have gameplay questions, check out the following useful resources:
        <ul>
          <li>
            <a href="https://www.wowhead.com/cata/guide/classes/warlock/demonology/dps-overview-pve">
              Demonology guide
            </a>{' '}
            on Wowhead
          </li>
          <li>
            <a href="https://discord.gg/8mrt6DE" target="_blank" rel="noopener noreferrer">
              Warlock Classic Discord
            </a>{' '}
            - the Classic Warlock Community Discord
          </li>
        </ul>
      </p>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/v14Rt9bdmhjMHQGD/32-Heroic+Magmaw+-+Kill+(2:15)/Softlock',
  // Add spells to display separately on the timeline
  timeline: { separateCastBars: [[]] },
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.CLASSIC_WARLOCK_DEMONOLOGY,
  // USE CAUTION when changing anything below this line.
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ClassicDemoWarlock" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default CONFIG;
