import React from 'react';

import SPECS from 'game/SPECS';
import Warning from 'interface/Alert/Warning';

import Config from 'parser/Config';

import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [],
  patchCompatibility: '8.3',
  isSupported: false,
  description: (
    <>
      <Warning>
        Enhancement shaman received some major changes for Shadowlands and needs some TLC. If you're looking at logs from before prepatch it should be ok, but bare.
      </Warning>
    </>
  ),
  exampleReport: '/report/XCr9vJdmcKQtTWLz/4-Heroic+Maut+-+Kill+(4:04)/Part%C3%ADcle/standard',

  spec: SPECS.ENHANCEMENT_SHAMAN,
  changelog: CHANGELOG,
  parser: () => import('./CombatLogParser' /* webpackChunkName: "EnhancementShaman" */).then(exports => exports.default),

  path: __dirname,
};

export default config;
