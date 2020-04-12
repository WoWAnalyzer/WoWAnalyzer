import React from 'react';

import { HawkCorrigan } from 'CONTRIBUTORS';
import SPECS from 'game/SPECS';
import Warning from 'interface/Alert/Warning';

import Config from 'parser/Config';
import CHANGELOG from './CHANGELOG';

const config: Config = {
  contributors: [HawkCorrigan],
  patchCompatibility: '8.0.1',
  isSupported: false,
  description: (
    <>
      <Warning>
        Hey there! Right now the Enhancement Shaman parser only holds very basic functionality. What we do show should be good to use, but it does not show the complete picture.
      </Warning>
    </>
  ),
  exampleReport: '/report/67LHQfJjCFzgyXBr/8-Normal+Stormwall+Blockade+-+Kill+(7:17)/118-Scryd',

  spec: SPECS.ENHANCEMENT_SHAMAN,
  changelog: CHANGELOG,
  parser: () => import('./CombatLogParser' /* webpackChunkName: "EnhancementShaman" */).then(exports => exports.default),

  path: __dirname,
};

export default config;
