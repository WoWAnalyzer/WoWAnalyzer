import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import retryingPromise from 'common/retryingPromise';
import SPECS from 'game/SPECS';
import Warning from 'interface/common/Alert/Warning';

import CHANGELOG from './CHANGELOG';

export default {
  // The people that have contributed to this spec recently. People don't have to sign up to be long-time maintainers to be included in this list. If someone built a large part of the spec or contributed something recently to that spec, they can be added to the contributors list. If someone goes MIA, they may be removed after major changes or during a new expansion.
  contributors: [Sharrq],
  // The WoW client patch this spec was last updated to be fully compatible with.
  patchCompatibility: '7.3.5',
  // If set to  false`, the spec will show up as unsupported.
  isSupported: false,
  // Explain the status of this spec's analysis here. Try to mention how complete it is, and perhaps show links to places users can learn more.
  // If this spec's analysis does not show a complete picture please mention this in the `<Warning>` component.
  description: (
    <>
      <>
      Hello Everyone! We are always looking to improve the Arms Warrior Analyzers and Modules; so if you find any issues or if there is something missing that you would like to see added, please open an Issue on GitHub or send a message to Sharrq on Discord (Sharrq#7530) <br /> <br />
	    Additionally, if you need further assistance in improving your gameplay as an Arms Warrior, you can refer to the following resources:<br />
      <a href="https://discord.gg/0pYY7932lTH4FHW6" target="_blank" rel="noopener noreferrer">Warrior Class Discord</a> <br />
      <a href="https://www.icy-veins.com/wow/arms-warrior-pve-dps-guide" target="_blank" rel="noopener noreferrer">Icy Veins (Arms Warrior Guide)</a> <br /><br />
    </>

      <Warning>
        Hello everyone! My name is <kbd>@Sharrq</kbd> and I am currently working on adding support for this spec with the help of the experts and theorycrafters in the Warrior Discord. While I do not play warrior (and never have), the experts and theorycrafters in the Warrior Class Discord were nice enough to assist with provide the suggestions and feedback that I will be adding to the spec. <br /><br />

        If you main an Arms Warrior and would like to contribute to this spec on a more permanent basis, check our <a href="https://github.com/WoWAnalyzer/WoWAnalyzer">GitHub</a> for more information.
      </Warning><br />
    </>
  ),
  // A recent example report to see interesting parts of the spec. Will be shown on the homepage.
  exampleReport: '/report/28aWCHp1zX6qVcMd/63-Heroic+Vectis+-+Kill+(5:28)/4-Mcsam',

  // Don't change anything below this line;
  // The current spec identifier. This is the only place (in code) that specifies which spec this parser is about.
  spec: SPECS.ARMS_WARRIOR,
  // The contents of your changelog.
  changelog: CHANGELOG,
  // The CombatLogParser class for your spec.
  parser: () => retryingPromise(() => import('./CombatLogParser' /* webpackChunkName: "ArmsWarrior" */).then(exports => exports.default)),
  // The path to the current directory (relative form project root). This is used for generating a GitHub link directly to your spec's code.
  path: __dirname,
};
