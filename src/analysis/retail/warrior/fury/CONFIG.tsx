import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';
import CHANGELOG from './CHANGELOG';

// import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.0.2',
  supportLevel: SupportLevel.Unmaintained,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      WowAnalyzer for Fury has only limited ability to parse logs and provides no accurate guidance
      to players. For guidance right now, make sure to check out the{' '}
      <a href="https://discordapp.com/invite/Skyhold">Warrior Class Discord</a> if you need more
      specific advice or a more detailed guide than the ones available on{' '}
      <a href="https://www.icy-veins.com/wow/fury-warrior-pve-dps-guide">Icy-Veins</a> and{' '}
      <a href="https://www.wowhead.com/fury-warrior-guide">Wowhead</a>.<br />
      <br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/RBX8qMdLjQvgYz6y/69-Mythic+Magmorax+-+Kill+(5:08)/Metajunkie/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.FURY_WARRIOR,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "FuryWarrior" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
