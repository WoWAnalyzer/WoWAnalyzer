import { jazminite } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import type Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const CONFIG: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [jazminite],
  expansion: Expansion.WrathOfTheLichKing,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '3.4.0',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Welcome! Thanks for checking out WoWAnalyzer. The Classic Unholy Death Knight guide is seeking
      a maintainer.
      <br />
      See the public GitHub repo or join our community Discord for information about contributing.
      Thanks!
    </>
  ),
  pages: {
    overview: {
      hideChecklist: false,
      text: <>The Classic Unholy Death Knight guide is seeking a maintainer.</>,
      type: 'info',
    },
  },
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/dyg2xpXQ9DNh1kzT/10-Normal+Patchwerk+-+Kill+(2:05)/Deathspacito',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.CLASSIC_DEATH_KNIGHT_UNHOLY,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ClassicUnholyDeathKnight" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
export default CONFIG;
