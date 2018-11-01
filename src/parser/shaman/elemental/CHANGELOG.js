import { niseko } from 'CONTRIBUTORS';

import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-11-01'),
    changes: <>Added support for <SpellLink id={SPELLS.ASTRAL_SHIFT.id} /> damage reduction.</>,
    contributors: [niseko],
  },
];
