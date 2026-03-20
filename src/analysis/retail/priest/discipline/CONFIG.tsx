import CHANGELOG from './CHANGELOG';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';
import { Vetyst } from 'CONTRIBUTORS';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Vetyst],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '12.0.1',
  supportLevel: SupportLevel.Foundation,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      <p>
        Welcome to the Discipline Priest analyzer. If you are new to discipline, here are a few
        guides to get you started:
      </p>
      <ul>
        <li>
          <a href="https://www.icy-veins.com/wow/discipline-priest-pve-healing-guide">Icy Veins</a>
        </li>
        <li>
          <a href="https://www.wowhead.com/guide/classes/priest/discipline/overview-pve-healer">
            Wowhead
          </a>
        </li>
      </ul>
      <p>
        This page is maintained with help from the Discipline Team at the{' '}
        <a
          href="https://discord.com/invite/warcraftpriests"
          target="_blank"
          rel="noopener noreferrer"
        >
          Warcraft Priests Discord
        </a>
        . You can join the #discipline channel to ask any priestly questions you may have.
      </p>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/G7DKYyjtp2XbcgqF/40-Heroic+Imperator+Averzian+-+Kill+(5:14)/4-Minkip/standard/overview',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.DISCIPLINE_PRIEST,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "DisciplinePriest" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};
export default config;
