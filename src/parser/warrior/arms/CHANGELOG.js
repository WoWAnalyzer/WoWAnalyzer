import React from 'react';

import { Aelexe, Zerotorescue, Matardarix } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-10-24'),
    changes: <>Added Checklist, Talents module, <SpellLink id={SPELLS.EXECUTIONERS_PRECISION_TRAIT.id} />, <SpellLink id={SPELLS.SEISMIC_WAVE.id} /> and <SpellLink id={SPELLS.TEST_OF_MIGHT.id} /> modules, rage usage module, suggestions regarding <SpellLink id={SPELLS.DEFENSIVE_STANCE_TALENT.id} />. Fixed <SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} /> cooldown reduction calculation.</>,
    contributors: [Matardarix],
  },
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
