import React from 'react';

import { Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-12-16'),
    changes: 'Updated for Patch 8.1.',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-11-17'),
    changes: <>Updated the <SpellLink id={SPELLS.HEATING_UP.id} /> module to fix some incorrect values and to properly handle <SpellLink id={SPELLS.SEARING_TOUCH_TALENT.id} />.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-11-15'),
    changes: <>Added support for <SpellLink id={SPELLS.BLASTER_MASTER.id} />.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-11-14'),
    changes: <>Updated the <SpellLink id={SPELLS.HOT_STREAK.id} /> module to fix some incorrect suggestions and make things easier to understand.</>,
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-10-11'),
    changes: 'Fixed bug that caused Suggestions to crash',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-9-14'),
    changes: 'Updated Checklist',
    contributors: [Sharrq],
  },
  {
    date: new Date('2018-6-28'),
    changes: 'Updated for 8.0 BFA Prepatch.',
    contributors: [Sharrq],
  },
];
