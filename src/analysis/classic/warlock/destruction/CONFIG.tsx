import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import type Config from 'parser/Config';
import CHANGELOG from './CHANGELOG';

import { SupportLevel } from 'parser/Config';
import { emallson } from 'CONTRIBUTORS';

const CONFIG: Config = {
  supportLevel: SupportLevel.Foundation,
  branch: GameBranch.Classic,
  contributors: [emallson],
  // The WoW client patch this spec was last updated.
  patchCompatibility: '4.4.0',
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    "/report/7hMAQ6RzkXF82G94/3-Heroic+Al'Akir+-+Kill+(5:57)/Deepdrei/standard/overview",

  // USE CAUTION when changing anything below this line.
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.CLASSIC_WARLOCK_DESTRUCTION,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ClassicWarlockDestruction" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default CONFIG;
