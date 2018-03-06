import React from 'react';

import { Hartra344, Versaya } from 'MAINTAINERS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.RESTORATION_SHAMAN,
  maintainers: [Hartra344, Versaya],
  patchCompatibility: '7.3.5',
  description: (
    <div>
      Welcome to the Resto Shaman analyzer! We hope you find these suggestions and statistics useful.<br /><br />

      If you want to learn more about Resto Shaman, join the Resto Shaman community at the <a href="https://discord.gg/AcTek6e" target="_blank" rel="noopener noreferrer">Ancestral Guidance channel</a>.
    </div>
  ),
  // Shouldn't have to change these:
  changelog: CHANGELOG,
  parser: CombatLogParser,
  // used for generating a GitHub link directly to your spec
  path: __dirname,
};
