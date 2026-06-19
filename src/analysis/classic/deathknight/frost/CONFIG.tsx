import { jazminite } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import type Config from 'parser/Config';
import CHANGELOG from './CHANGELOG';
import { SupportLevel } from 'parser/Config';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [jazminite],
  branch: GameBranch.Classic,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '5.4.8',
  // Update to false when the spec is mostly complete (and safe to use)
  supportLevel: SupportLevel.Foundation,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Welcome to the WoWAnalyzer for Mists of Pandaria Classic Frost Death Knight! This analysis
      covers core MoP Frost DK mechanics: Killing Machine and Rime proc efficiency, disease uptime,
      and cooldown usage. The spec is actively being developed — feedback and contributions welcome.
      {/* oxlint-disable-next-line wowanalyzer/no-br -- Baseline suppression */}
      <br />
      Join us on Discord or open a PR on GitHub to help improve the analysis!
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '',
  // Add spells to display separately on the timeline
  timeline: {
    separateCastBars: [[]], // TODO: add Pillar of Frost, ERW
  },
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.CLASSIC_DEATH_KNIGHT_FROST,

  // USE CAUTION when changing anything below this line.
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ClassicFrostDeathKnight" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
