import { Katorri } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';
import { SupportLevel } from 'parser/Config';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Katorri],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '12.1.0',
  supportLevel: SupportLevel.MaintainedFull,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello! Thanks for checking out the Destruction Analyzer. If you have any feedback or
      suggestions, feel free to reach out to me via Discord (you can reach me @Katorri on either the{' '}
      <a href="https://discord.com/invite/AxphPxU" target="_blank" rel="noopener noreferrer">
        WoWAnalyzer
      </a>{' '}
      or the{' '}
      <a href="https://discord.gg/BlackHarvest" target="_blank" rel="noopener noreferrer">
        Warlock
      </a>{' '}
      discords) or drop an issue in the GitHub repo. If you have any questions about Warlocks, feel
      free to pay a visit to{' '}
      <a href="https://discord.gg/BlackHarvest" target="_blank" rel="noopener noreferrer">
        Council of the Black Harvest Discord
      </a>
      &nbsp; or{' '}
      <a
        href="https://www.kalamazi.gg/guides/destruction"
        target="_blank"
        rel="noopener noreferrer"
      >
        Kalamazi&apos;s Destruction Guide
      </a>{' '}
      or{' '}
      <a
        href="https://www.method.gg/guides/destruction-warlock"
        target="_blank"
        rel="noopener noreferrer"
      >
        Method&apos;s Destruction Guide
      </a>
      .
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/yCzXLNfpcQTBJD6V/27-Heroic+Entombed+Sentinels+-+Kill+(5:15)/1-Katorrí/standard/overview',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.DESTRUCTION_WARLOCK,
  // The contents of your changelog.
  changelog: CHANGELOG, // CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "DestructionWarlock" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};
