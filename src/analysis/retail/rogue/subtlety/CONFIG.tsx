import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import CHANGELOG from './CHANGELOG';
import { Anty } from 'CONTRIBUTORS';
import Config from 'parser/Config';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Anty],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.0.2',
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hey Subtlety Rogues! <br /> <br />
      The Subtlety Rogue module is still being worked on. Currently, it gives a good analysis of the
      single target rotation, and highlights major mistakes.
      <br /> <br />
      All recommendations and analysis should be in line with{' '}
      <a href="http://www.ravenholdt.net/subtlety-guide/"> wEak's guide </a> and Simcraft APL.
      <br /> <br />
      If there is something missing, incorrect, or inaccurate, please report it on{' '}
      <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or contact{' '}
      <kbd></kbd> on Discord.
      <br />
      <br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/BKWZ4PvqFArtgXHd/1-Heroic+Grong+-+Kill+(5:05)/4-Phíl',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.SUBTLETY_ROGUE,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "SubtletyRogue" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
