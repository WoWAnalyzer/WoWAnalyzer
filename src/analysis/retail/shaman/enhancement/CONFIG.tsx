import { Seriousnes } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import { AlertWarning } from 'interface';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [Seriousnes],
  expansion: Expansion.Dragonflight,
  patchCompatibility: '10.1.7',
  isPartial: false,
  description: (
    <>
      <AlertWarning>
        Analytics are being developed for a level 70 dragonflight character on beta. Right now the
        Enhancement Analyzer is a work-in-progress, and only holds very basic functionality.
      </AlertWarning>
      <br />
      Hey there! Thanks for checking out the Enhancement Analyzer. If you have any feedback or
      suggestions, feel free to reach out to Vetyst via Discord (Vetyst#0001) or drop an issue in
      the GitHub repo.
    </>
  ),
  exampleReport:
    '/report/p4MjCghDVP6TGvfQ/1-Heroic+Rashok,+the+Elder+-+Kill+(2:36)/Seriousnes/standard',
  spec: SPECS.ENHANCEMENT_SHAMAN,
  changelog: CHANGELOG,
  guideDefault: true,
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "EnhancementShaman" */).then(
      (exports) => exports.default,
    ),

  path: __dirname,
};

export default config;
