import { Sharrq } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';

import CHANGELOG from './CHANGELOG';
import AlertWarning from 'interface/AlertWarning';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Sharrq],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.2.7',
  supportLevel: SupportLevel.MaintainedFull,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      If you are looking for help improving your gameplay, refer to the resources below:
      <br />
      <a href="https://discord.gg/0gLMHikX2aZ23VdA" target="_blank" rel="noopener noreferrer">
        Mage Class Discord
      </a>{' '}
      <br />
      <a href="https://www.mage-hub.com/fire" target="_blank" rel="noopener noreferrer">
        Mage Hub Guide (Mage Guides/Sims)
      </a>{' '}
      <br />
      <a href="https://www.wowhead.com/fire-mage-guide" target="_blank" rel="noopener noreferrer">
        Wowhead (Fire Mage Guide)
      </a>{' '}
      <br />
    </>
  ),
  pages: {
    overview: {
      frontmatterType: 'guide',
      notes: (
        <AlertWarning>
          This analysis is a Work in Progress. I have done some minor updates to Fire, but there are
          still things that have yet to be implemented or added. Once Blizzard stops changing things
          every week, and once the theorycrafters finish running numbers, then I will update this.
          Apologies for the delays, I promise I am working on it. Ping me in the Mage Discord if you
          have questions about this. <code>@Sharrq</code>
        </AlertWarning>
      ),
    },
  },
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    'report/XLj7amG2gr4Hwdb3/30-Heroic+Rashok,+the+Elder+-+Kill+(4:35)/Pyrenn/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.FIRE_MAGE,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "FireMage" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
