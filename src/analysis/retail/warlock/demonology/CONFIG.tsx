import { Zyer, Gazh } from 'CONTRIBUTORS';
import GameBranch from 'game/GameBranch';
import SPECS from 'game/SPECS';
import Config, { SupportLevel } from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Zyer, Gazh],
  branch: GameBranch.Retail,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '11.0.2',
  supportLevel: SupportLevel.MaintainedPartial,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hey there! Thanks for checking out the Demonology Analyzer. If you have any feedback or
      suggestions, feel free to reach out to me via Discord (you can reach me @zyer on either the{' '}
      <a href="https://discord.com/invite/AxphPxU" target="_blank" rel="noopener noreferrer">
        WoWAnalyzer
      </a>{' '}
      or the{' '}
      <a href="https://discord.gg/BlackHarvest" target="_blank" rel="noopener noreferrer">
        Warlock
      </a>{' '}
      discords) or drop an issue in the GitHub repo. If you have any questions about Warlocks, feel
      free to pay a visit to the{' '}
      <a href="https://discord.gg/BlackHarvest" target="_blank" rel="noopener noreferrer">
        Council of the Black Harvest Discord
      </a>{' '}
      or check out any of the following guides:{' '}
      <table>
        <tr>
          <a
            href="https://www.icy-veins.com/wow/demonology-warlock-pve-dps-guide"
            target="_blank"
            rel="noopener noreferrer"
          >
            Icy-Veins.com by Motoko
          </a>
          <tr>
            <a
              href="https://www.wowhead.com/guide/classes/warlock/demonology/overview-pve-dps"
              target="_blank"
              rel="noopener noreferrer"
            >
              Wowhead.com by Not
            </a>
          </tr>
          <tr>
            <a
              href="https://www.method.gg/guides/demonology-warlock"
              target="_blank"
              rel="noopener noreferrer"
            >
              Method.gg by Sjeletyven
            </a>
          </tr>
        </tr>
        <tr>
          <a
            href="https://www.kalamazi.gg/guides/demonology"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kalamazi.gg by Kalamazi
          </a>
        </tr>
      </table>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: "/report/hY6vg1LxqzmR94XG/126-Heroic+Broodtwister+Ovi'nax+-+Kill+(6:24)/Meurthe/",

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.DEMONOLOGY_WARLOCK,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "DemonologyWarlock" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};

export default config;
