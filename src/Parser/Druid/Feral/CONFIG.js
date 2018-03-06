import React from 'react';

import { Thieseract } from 'MAINTAINERS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.FERAL_DRUID,
  maintainers: [Thieseract],
  patchCompatibility: '7.3.5',
  description: (
    <div>
      Questions about Feral? Visit <a href="http://www.discord.me/Dreamgrove">Dreamgrove</a> Discord.
    </div>
  ),
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
