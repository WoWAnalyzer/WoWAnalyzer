import { Awildfivreld, Periodic } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Awildfivreld, Periodic],
  expansion: Expansion.Dragonflight,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '10.1.7' as const,
  isPartial: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello there! Welcome to the analyzer for Elemental Shaman! This analyzer has functionalities
      that I hope you find useful when playing the spec. If you have any input or suggestions please
      ask questions in the #elemental channel in the{' '}
      <a href="https://discord.gg/earthshrine">Earthshrine discord</a>.
      <br />
      <br />
      <br />
      More resources for Elemental:
      <br />
      <a href="https://discord.gg/earthshrine" target="_blank" rel="noopener noreferrer">
        Shaman Class Discord
      </a>{' '}
      <br />
      <a href="https://stormearthandlava.com/" target="_blank" rel="noopener noreferrer">
        Storm, Earth and Lava
      </a>{' '}
      <br />
      <a
        href="https://www.wowhead.com/elemental-shaman-guide"
        target="_blank"
        rel="noopener noreferrer"
      >
        Wowhead Guide
      </a>{' '}
      <br />
      <a
        href="https://www.icy-veins.com/wow/elemental-shaman-pve-dps-guide"
        target="_blank"
        rel="noopener noreferrer"
      >
        Icy Veins Guide
      </a>{' '}
      <br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport:
    '/report/L1R2zVKY8ZDxCTNb/15-Mythic+Scalecommander+Sarkareth+-+Kill+(7:21)/Nerdshockz/standard',
  guideDefault: true,

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.ELEMENTAL_SHAMAN,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "ElementalShaman" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: import.meta.url,
};
