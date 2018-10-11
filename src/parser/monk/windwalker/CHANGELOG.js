import { Juko8 } from 'CONTRIBUTORS';

import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-09-09'),
    changes: <>Added Azerite statistic for <SpellLink id={SPELLS.SWIFT_ROUNDHOUSE.id} /> </>,
    contributors: [Juko8],
  },
  {
    date: new Date('2018-09-04'),
    changes: <>Added Azerite statistics for <SpellLink id={SPELLS.IRON_FISTS.id} /> and <SpellLink id={SPELLS.MERIDIAN_STRIKES.id} /> </>,
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
