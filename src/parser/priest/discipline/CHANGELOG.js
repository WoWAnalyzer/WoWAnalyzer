import React from 'react';

import { Oratio, Reglitch, Zerotorescue } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-09-14'),
    changes: <>Fixed the <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.id} /> analyzer.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-07-31'),
    changes: <>Rework of the <SpellLink id={SPELLS.GRACE.id} /> module.</>,
    contributors: [Oratio],
  },
  {
    date: new Date('2018-07-26'),
    changes: <>Added support for the new <SpellLink id={SPELLS.PENANCE_CAST.id} /> event, thanks Blizzard.</>,
    contributors: [Reglitch],
  },
  {
    date: new Date('2018-07-19'),
    changes: <>Fixed <SpellLink id={SPELLS.SINS_OF_THE_MANY_TALENT.id} /> bug.</>,
    contributors: [Oratio],
  },
  {
    date: new Date('2018-07-24'),
    changes: <>Fix crash when using <SpellLink id={SPELLS.LUMINOUS_BARRIER_TALENT.id} />.</>,
    contributors: [Reglitch],
  },
  {
    date: new Date('2018-07-18'),
    changes: <>Now with 100% more Batle for Azeroth.</>,
    contributors: [Reglitch],
  },
];
