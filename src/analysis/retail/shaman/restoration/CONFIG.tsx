
import { Arlie, niseko, Vohrr } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';
import { AlertWarning } from 'interface';
import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const CONFIG: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [niseko, Arlie, Vohrr],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.1.0',
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Welcome to the Resto Shaman analyzer! We hope you find these suggestions and statistics
      useful.
      <br />
      <br />
      If you want to learn more about Resto Shaman, join the Resto Shaman community at the{' '}
      <a href="https://discord.gg/AcTek6e" target="_blank" rel="noopener noreferrer">
        Ancestral Guidance
      </a>{' '}
      discord server and make sure to visit the guides on{' '}
      <a href="https://www.wowhead.com/restoration-shaman-guide">Wowhead</a> and{' '}
      <a href="https://www.icy-veins.com/wow/restoration-shaman-pve-healing-guide">Icy Veins</a>.
      <br />
      <br />
      <AlertWarning>
        If there is something missing, incorrect, or inaccurate, please report it on{' '}
        <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new">GitHub</a> or contact us on{' '}
        <a href="https://discord.gg/AxphPxU">Discord</a>.
      </AlertWarning>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: 'report/nLqjdwhyG4r7FxJW/19-Mythic+Terros+-+Kill+(4:22)/Fakeblonde/standard',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.RESTORATION_SHAMAN,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "RestorationShaman" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
  guideDefault: false,
};
export default CONFIG;
