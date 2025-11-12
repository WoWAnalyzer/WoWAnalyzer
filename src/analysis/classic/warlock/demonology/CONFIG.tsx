import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import type Config from 'parser/Config';
import CHANGELOG from './CHANGELOG';

import { SupportLevel } from 'parser/Config';
import { jazminite } from 'CONTRIBUTORS';

const CONFIG: Config = {
  supportLevel: SupportLevel.Foundation,
  branch: GameBranch.Classic,
  contributors: [jazminite],
  // The WoW client patch this spec was last updated.
  patchCompatibility: '5.5.0',
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/mQaLxHZGypBrTc6z/9-Heroic+Garalon+-+Kill+(4:15)/Blurkythree',

  // USE CAUTION when changing anything below this line.
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.CLASSIC_WARLOCK_DEMONOLOGY,
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
