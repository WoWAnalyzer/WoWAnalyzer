import React from 'react';

import { HawkCorrigan, Draenal } from 'CONTRIBUTORS';
import SPECS from 'game/SPECS';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [HawkCorrigan, Draenal],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.2.5',
  // If set to  false`, the spec will show up as unsupported.
  isSupported: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Hello there! Welcome to the analyzer for Elemental Shaman! This analyzer has functionalities that I hope you find useful when playing the spec. If you have any input or suggestions please contact HawkCorrigan(HawkCorrigan#1811) or Draenal(Draenal#4089) on Discord.<br /><br />

      <br />More resources for Elemental:<br />
      <a href="https://discord.gg/earthshrine" target="_blank" rel="noopener noreferrer">Shaman Class Discord</a> <br />
      <a href="https://stormearthandlava.com/" target="_blank" rel="noopener noreferrer">Storm, Earth and Lava</a> <br />
      <a href="https://www.wowhead.com/elemental-shaman-guide" target="_blank" rel="noopener noreferrer">Wowhead Guide</a> <br />
      <a href="https://www.icy-veins.com/wow/elemental-shaman-pve-dps-guide" target="_blank" rel="noopener noreferrer">Icy Veins Guide</a> <br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/QFbdLCMHtxzTjfZ1/5-Heroic+Abyssal+Commander+Sivara+-+Kill+(2:43)/Goff',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.ELEMENTAL_SHAMAN,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "ElementalShaman" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
