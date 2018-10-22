import React from 'react';

import { Oratio, Reglitch, Zerotorescue, niseko } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-10-17'),
    changes: `The Atonement sources tab should no longer display spells that do not cause atonement healing.`,
    contributors: [niseko],
    clIndex: 'Discipline20181007.1',
  },
  {
    date: new Date('2018-09-14'),
    changes: <>Fixed the <SpellLink id={SPELLS.TWIST_OF_FATE_TALENT_DISCIPLINE.id} /> analyzer.</>,
    contributors: [Zerotorescue],
    clIndex: 'Discipline20180914.1',
  },
  {
    date: new Date('2018-07-31'),
    changes: <>Rework of the <SpellLink id={SPELLS.GRACE.id} /> module.</>,
    contributors: [Oratio],
    clIndex: 'Discipline20180731.1',
  },
  {
    date: new Date('2018-07-26'),
    changes: <>Added support for the new <SpellLink id={SPELLS.PENANCE_CAST.id} /> event, thanks Blizzard.</>,
    contributors: [Reglitch],
    clIndex: 'Discipline20180726.1',
  },
  {
    date: new Date('2018-07-19'),
    changes: <>Fixed <SpellLink id={SPELLS.SINS_OF_THE_MANY_TALENT.id} /> bug.</>,
    contributors: [Oratio],
    clIndex: 'Discipline20180719.1',
  },
  {
    date: new Date('2018-07-24'),
    changes: <>Fix crash when using <SpellLink id={SPELLS.LUMINOUS_BARRIER_TALENT.id} />.</>,
    contributors: [Reglitch],
    clIndex: 'Discipline20180724.1',
  },
  {
    date: new Date('2018-07-18'),
    changes: <>Now with 100% more Batle for Azeroth.</>,
    contributors: [Reglitch],
    clIndex: 'Discipline20180718.1',
  },
];
