import { jazminite } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import type Config from 'parser/Config';
import CHANGELOG from './CHANGELOG';
import { SupportLevel } from 'parser/Config';

const CONFIG: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [jazminite],
  branch: GameBranch.Classic,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '4.4.0',
  supportLevel: SupportLevel.Foundation,
  // You can explain the status of this spec's analysis here by uncommenting the description section if you need a custom message. Otherwise it is covered by the foundation guide.
  // description: (
  //   <>
  //     Welcome! Thanks for checking out WoWAnalyzer.
  //     <br />
  //     <br />
  //     Your custom message here.
  //     <br />
  //     See the public GitHub repo or join our community Discord for information about contributing. Thanks!
  //   </>
  // ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/cqX4Zd7yvTh863Hf/55-Heroic+Magmaw+-+Kill+(2:23)/Yetzdru',
  // Add spells to display separately on the timeline
  timeline: { separateCastBars: [[]] },
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.CLASSIC_DRUID_BALANCE,

  // USE CAUTION when changing anything below this line.
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ClassicBalanceDruid" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default CONFIG;
