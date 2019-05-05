import React from 'react';

import { Gebuz, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2019-4-30'),
    changes: 'Added High Noon and Power of the Moon azerite pieces to the statistics tab.',
    contributors: [Abelito75],
  },
  {
    date: new Date('2019-4-27'),
    changes: 'Added DawningSun azerite piece to the statistics tab.',
    contributors: [Abelito75],
  },
  { 
    date: new Date('2018-8-26'),
    changes: 'Updated the empowerment tracker to use the new log format for the buff.',
    contributors: [Gebuz],
  },
  { 
    date: new Date('2018-6-21'),
    changes: <>Removed Stellar Empowerment and added haste tracker for <SpellLink id={SPELLS.STARLORD_TALENT.id} /></>,
    contributors: [Gebuz],
  },
];
