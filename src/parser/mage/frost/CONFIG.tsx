import React from 'react';

import { Sharrq, Dambroda } from 'CONTRIBUTORS';
import Config from 'parser/Config';

import SPECS from 'game/SPECS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import NoIceLance from './icons/noicelance.jpg';
import CHANGELOG from './CHANGELOG';

const config: Config = {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Sharrq, Dambroda],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '8.3',
  // If set to  false`, the spec will show up as unsupported.
  isSupported: true,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more. If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      Welcome to the Frost Mage analyzer! We hope the suggestions and statistics displayed here will help you improve your gameplay. Playing a Frost Mage revolves heavily around making the most of your talents (like <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> or <SpellLink id={SPELLS.THERMAL_VOID_TALENT.id} />) and procs (like <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> and <SpellLink id={SPELLS.FINGERS_OF_FROST.id} />), so that's the majority of what you'll see analyzed here.<br /><br />

      We are always looking to improve, so if you encounter any issues or have any suggestions, please <a href="https://github.com/WoWAnalyzer/WoWAnalyzer/issues/new?labels=Mage" target="_blank" rel="noopener noreferrer">open an issue</a> on GitHub or send us a message on the <a href="https://wowanalyzer.com/discord" target="_blank" rel="noopener noreferrer">WoWAnalyzer Discord</a>.<br /><br />

      If you would like more information on improving your Frost Mage gameplay, check out these additional resources:<br />
      <a href="https://discord.gg/0gLMHikX2aZ23VdA" target="_blank" rel="noopener noreferrer">Mage Class Discord</a> <br />
      <a href="https://www.altered-time.com/forum/" target="_blank" rel="noopener noreferrer">Altered Time (Mage forums & guides)</a> <br />
      <a href="https://www.icy-veins.com/wow/frost-mage-pve-dps-guide" target="_blank" rel="noopener noreferrer">Icy Veins (Frost Mage guide)</a>
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/BTmaxzd4vKy2GXD1/5-Heroic+Maut+-+Kill+(3:24)/Sareo/standard',
  builds: {
    NO_IL: {
      url: "noil",
      name: "No Ice Lance",
      icon: <img src={NoIceLance} alt="No Ice lance" className="icon" />,
      visible: true,
    },
  },
  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.FROST_MAGE,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => import('./CombatLogParser' /* webpackChunkName: "FrostMage" */).then(exports => exports.default),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
export default config;
