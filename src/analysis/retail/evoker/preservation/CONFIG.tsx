import { Trevor, Harrek } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Trevor, Harrek],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.0.2',
  supportLevel: SupportLevel.MaintainedFull,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello all! Thanks so much for taking the time use this tool as a way to improve your play. The
      goal is to provide targeted suggestions to improve your overall Preservation Evoker play.
      <br />
      The core elements of the class have been implemented, but if you have any suggestions then
      feel free to make a Github issue.
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.PRESERVATION_EVOKER,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "PreservationEvoker" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
