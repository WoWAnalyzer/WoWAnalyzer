import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import { ToppleTheNun } from 'CONTRIBUTORS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [ToppleTheNun],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.0.5',
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hey Assassination Rogues! <br /> <br />
      If you want to learn more about Assassination, head over to{' '}
      <a href="https://www.ravenholdt.net/" target="_blank" rel="noopener noreferrer">
        Ravenholt
      </a>
      , or join its{' '}
      <a href="https://discordapp.com/invite/mnwuJ7e" target="_blank" rel="noopener noreferrer">
        Discord Channel
      </a>
      .
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/bxFnaCzR972tcqLQ/2-Mythic+Eranog+-+Kill+(2:31)/Seldom',
  guideDefault: true,
  guideOnly: true,

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.ASSASSINATION_ROGUE,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "AssassinationRogue" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
