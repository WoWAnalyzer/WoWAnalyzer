import { Seriousnes } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import { AlertWarning } from 'interface';
import Config, { SupportLevel } from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [Seriousnes],
  branch: GameBranch.Retail,
  patchCompatibility: '11.0.5',
  supportLevel: SupportLevel.MaintainedFull,
  description: (
    <>
      <AlertWarning>
        Analytics are being developed for a level 80 The War Within character on beta. Right now the
        Enhancement Analyzer is a work-in-progress, and only holds very basic functionality.
      </AlertWarning>
      <br />
      Hey there! Thanks for checking out the Enhancement Analyzer. If you have any feedback or
      suggestions, feel free to reach out to Seriousnes via Discord (seriousnes) or drop an issue in
      the GitHub repo.
    </>
  ),
  exampleReport:
    "/report/fPAk1jwMBC6Ym4aV/33-Mythic+Nexus-Princess+Ky'veza+-+Kill+(6:17)/Seriousnes/standard",
  spec: SPECS.ENHANCEMENT_SHAMAN,
  changelog: CHANGELOG,
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "EnhancementShaman" */).then(
      (exports) => exports.default,
    ),
  path: import.meta.url,
};

export default config;
