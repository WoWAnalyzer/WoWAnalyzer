import { ToppleTheNun } from 'CONTRIBUTORS';
import Expansion from 'game/Expansion';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [ToppleTheNun],
  expansion: Expansion.Shadowlands,
  // The WoW client patch this spec was last updated.
  patchCompatibility: '9.2.5',
  isPartial: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Welcome to the Havoc Demon Hunter analyzer! We hope you find these suggestions and statistics
      useful.
      <br />
      <br />
      More resources for Havoc:
      <br />
      <a href="https://discord.gg/zGGkNGC" target="_blank" rel="noopener noreferrer">
        Demon Hunter Class Discord
      </a>{' '}
      <br />
      <a
        href="https://www.wowhead.com/havoc-demon-hunter-guide"
        target="_blank"
        rel="noopener noreferrer"
      >
        Wowhead Guide
      </a>{' '}
      <br />
      <a
        href="https://www.icy-veins.com/wow/havoc-demon-hunter-pve-dps-guide"
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
    '/report/Y9Z4RLcnNbz2TkAX/11-Mythic+Skolex,+the+Insatiable+Ravener+-+Kill+(5:02)/Felahunter',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.HAVOC_DEMON_HUNTER,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () =>
    import('./CombatLogParser' /* webpackChunkName: "HavocDemonHunter" */).then(
      (exports) => exports.default,
    ),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
