import { Hana } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Hana],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.2.6',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Welcome to the Discipline Priest analyzer. If you are new to discipline, here are a few guides
      to get you started:
      <br />
      <br />
      <a href="https://www.icy-veins.com/wow/discipline-priest-pve-healing-guide">Icy-Veins</a>
      <br />
      <a href="https://warcraftpriests.com/discipline/discipline-priest-quickstart/">
        Warcraftpriests
      </a>
      <br />
      <br />
      This page is maintained with help from the Discipline Team at the{' '}
      <a href="https://discord.gg/WarcraftPriests" target="_blank" rel="noopener noreferrer">
        Warcraft Priests Discord
      </a>
      . You can join the #discipline channel to ask any priestly questions you may have.
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/TDdwqCKRmZzpX8hY/32-Mythic+Kurog+Grimtotem+-+Kill+(8:51)/Xephiroze/standard/overview',

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
  path: __dirname,
};
export default config;
