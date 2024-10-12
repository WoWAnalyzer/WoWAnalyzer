import { Sharrq, Sref } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';

import CHANGELOG from './CHANGELOG';
import AlertWarning from 'interface/AlertWarning';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Sharrq, Sref],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.0.2',
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
      <a href="https://discord.gg/UrczP9U" target="_blank" rel="noopener noreferrer">
        Arcane Spec Discord
      </a>{' '}
      <br />
      <a href="https://www.altered-time.com/forum/" target="_blank" rel="noopener noreferrer">
        Altered Time (Mage Forums/Guides)
      </a>{' '}
      <br />
      <a href="https://www.wowhead.com/arcane-mage-guide" target="_blank" rel="noopener noreferrer">
        Wowhead (Arcane Mage Guide)
      </a>{' '}
      <br />
      <a
        href="https://www.icy-veins.com/wow/arcane-mage-pve-dps-guide"
        target="_blank"
        rel="noopener noreferrer"
      >
        Icy Veins (Arcane Mage Guide)
      </a>{' '}
      <br />
    </>
  ),
  pages: {
    overview: {
      frontmatterType: 'guide',
      notes: (
        <AlertWarning>
          This has been updated for the latest Arcane Mage changes. If something is missing or
          incorrect, please ping me (<code>@Sharrq</code>) in the Mage Discord and let me know.
        </AlertWarning>
      ),
    },
  },
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/x3ZYqgMm6VPHXkyc/2-Mythic+Eranog+-+Kill+(2:49)/Bthread/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.ARCANE_MAGE,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ArcaneMage" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
