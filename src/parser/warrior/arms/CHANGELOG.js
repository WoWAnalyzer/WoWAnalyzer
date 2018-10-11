import React from 'react';

import { Aelexe, Zerotorescue } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-06-30'),
    changes: <>Update all abilities to new BFA values, removed incompatible modules and added an <SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> statistic.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-06-16'),
    changes: <>Fixed a rare crash when casting <SpellLink id={SPELLS.EXECUTE.id} /> on a non-boss target.</>,
    contributors: [Aelexe],
  },
];
