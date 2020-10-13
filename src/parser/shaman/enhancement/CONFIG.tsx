import React from 'react';

import { HawkCorrigan, Vetyst, Vonn } from 'CONTRIBUTORS';
import SPECS from 'game/SPECS';
import Warning from 'interface/Alert/Warning';

import Config from 'parser/Config';
import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [HawkCorrigan, Vetyst, Vonn],
  patchCompatibility: '9.0.1',
  isSupported: true,
  description: (
    <>
    <Warning>
      Right now the Enhancement Analyzer is a work-in-progress, and only holds very basic functionality.
    </Warning>
    <br />
    Hey there! Thanks for checking out the Enhancement Analyzer. If you have any feedback or suggestions, feel free to reach out to Vonn via Discord (vønn#2776) or drop an issue in the GitHub repo.
    </>
  ),
  exampleReport: '/report/PD96Rd7x8rmKcjhn/34-Mythic+The+Council+of+Blood+-+Wipe+15+(4:09)/By',

  spec: SPECS.ENHANCEMENT_SHAMAN,
  changelog: CHANGELOG,
  parser: () => import('./CombatLogParser' /* webpackChunkName: "EnhancementShaman" */).then(exports => exports.default),

  path: __dirname,
};

export default config;
