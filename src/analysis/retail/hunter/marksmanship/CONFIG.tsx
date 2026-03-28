import { Path } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';
import CHANGELOG from './CHANGELOG';
const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Path],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '12.0.1',
  supportLevel: SupportLevel.Foundation,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      <p>
        Hello and welcome to the Marksmanship Hunter analyzer for Midnight Season 1! This analyzer
        tracks your Trueshot windows, Bulletstorm stack efficiency, Moonlight Chakram usage
        (Sentinel), Aimed Shot cooldown management, and on-use trinket alignment.
      </p>
      <p>
        Focus on improving one thing at a time - start with your Bulletstorm stack count and
        Trueshot window quality, as these have the highest impact on your parse.
      </p>
      <p>
        If you want to learn more about Marksmanship Hunters, join the Hunter community on the
        Trueshot Lodge Discord:{' '}
        <a href="https://www.discord.gg/trueshot" target="_blank" rel="noopener noreferrer">
          discord.gg/trueshot
        </a>
        . The <kbd>#marksmanship</kbd> channel has a lot of helpful people. The guides on{' '}
        <a href="https://www.wowhead.com/guide/classes/hunter/marksmanship/overview-pve-dps">
          Wowhead
        </a>{' '}
        and{' '}
        <a href="https://www.icy-veins.com/wow/marksmanship-hunter-pve-dps-guide">Icy-Veins</a>{' '}
        are both excellent resources, maintained by Azortharion.
      </p>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: 'report/wGX3k1zPD6MWVpCd/32-Mythic+Imperator+Averzian+-+Kill+(6:53)/137-Alltheshots/standard',
  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.MARKSMANSHIP_HUNTER,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "MarksmanshipHunter" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};
export default config;



