import React from 'react';

import { Khadaj, niseko, Yajinni, Zerotorescue } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { change, date } from 'common/changelog';

export default [
  {
    date: new Date('2019-04-09'),
    changes: <>Adding Holy Nova card and updating spreadsheet</>,
    contributors: [Khadaj],
  },
  {
    date: new Date('2019-03-12'),
    changes: <>Fixed an error in the <SpellLink id={SPELLS.PRAYERFUL_LITANY.id} /> analyzer.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2018-12-18'),
    changes: <>Adding <SpellLink id={SPELLS.PROMISE_OF_DELIVERANCE.id} /> and <SpellLink id={SPELLS.DEATH_DENIED.id} />.</>,
    contributors: [Khadaj],
  },
  {
    date: new Date('2018-11-05'),
    changes: 'Adding Renew suggestion.',
    contributors: [Khadaj],
  },
  {
    date: new Date('2018-10-22'),
    changes: 'Adding mana efficiency tab.',
    contributors: [Khadaj],
  },
  {
    date: new Date('2018-09-13'),
    changes: 'Adding Holy Priest Azerite traits.',
    contributors: [Khadaj],
  },
  {
    date: new Date('2018-09-07'),
    changes: 'Creating Holy Priest spreadsheet export.',
    contributors: [Khadaj],
  },
  {
    date: new Date('2018-09-06'),
    changes: 'Updating base Holy Priest checklist.',
    contributors: [Khadaj],
  },
  {
    date: new Date('2018-07-28'),
    changes: <>Added suggestion for maintaining <SpellLink id={SPELLS.PERSEVERANCE_TALENT.id} /> and <SpellLink id={SPELLS.POWER_WORD_FORTITUDE.id} /> buffs.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-28'),
    changes: <>Added Stat box for <SpellLink id={SPELLS.COSMIC_RIPPLE_TALENT.id} />.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-26'),
    changes: <>Added Stat box for <SpellLink id={SPELLS.TRAIL_OF_LIGHT_TALENT.id} />.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-05'),
    changes: 'Updated Holy Priest spells for BFA and accounted for Holy Words cooldown reductions.',
    contributors: [niseko],
  },
];
