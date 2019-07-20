import { Juko8 } from 'CONTRIBUTORS';

import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  {
    date: new Date('2019-03-17'),
    changes: <>Updated handling of <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} /> and removed its energy gained statistic as it is no longer feasible to calculate it accurately</>,
    contributors: [Juko8],
  },
  {
    date: new Date('2019-01-05'),
    changes: 'Added tracking of time spent at maximum energy',
    contributors: [Juko8],
  },
  {
    date: new Date('2019-01-02'),
    changes: <>Added Azerite statistic for <SpellLink id={SPELLS.FURY_OF_XUEN.id} />.</>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-12-27'),
    changes: <>Added Azerite statistic for <SpellLink id={SPELLS.GLORY_OF_THE_DAWN.id} />.</>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-09-09'),
    changes: 'Added Azerite statistic for Swift Roundhouse.',
    contributors: [Juko8],
  },
  {
    date: new Date('2018-09-04'),
    changes: 'Added Azerite statistics for Iron Fists and Meridian Strikes.',
    contributors: [Juko8],
  },
  {
    date: new Date('2018-08-31'),
    changes: 'Removed "Casts in Storm, Earth and Fire/Serenity statistics" since it\'s no longer providing accurate analysis',
    contributors: [Juko8],
  },
  {
    date: new Date('2018-08-29'),
    changes: 'Removed legion legendaries and tiersets',
    contributors: [Juko8],
  },
  {
    date: new Date('2018-06-16'),
    changes: <>Updated for 8.0 Battle for Azeroth prepatch. All artifact traits and related analysis removed. Bad <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> casts statistic and suggestions has been replaced with statistic and suggestions on <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon />'s new cooldown reductions mechanic </>,
    contributors: [Juko8],
  },
];
