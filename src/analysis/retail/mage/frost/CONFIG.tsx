import { Sharrq } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Sharrq],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.2.5',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more. If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      If you are looking for help improving your gameplay, refer to the resources below:
      <br />
      <a href="https://discord.gg/0gLMHikX2aZ23VdA" target="_blank" rel="noopener noreferrer">
        Mage Class Discord
      </a>{' '}
      <br />
      <a href="https://www.mage-hub.com/frost" target="_blank" rel="noopener noreferrer">
        Mage Hub Guide (Mage Guides/Sims)
      </a>{' '}
      <br />
      <a href="https://www.wowhead.com/frost-mage-guide" target="_blank" rel="noopener noreferrer">
        Wowhead (Frost Mage Guide)
      </a>{' '}
      <br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/BtwMqQ9mJcjYTvKz/4-Mythic+Gnarlroot+-+Kill+(2:53)/18-Choihyeon/standard',
  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.FROST_MAGE,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "FrostMage" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
  guideDefault: false,
};
export default config;
