import { Juko8 } from 'CONTRIBUTORS';

import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2019, 8, 20), 'Reverse Harm will now be shown correctly in the Chi overview', Juko8),
  change(date(2019, 8, 20), <>Updated <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> module.</>, Juko8),
  change(date(2019, 8, 18), 'Updated visuals of statistics for baseline spells', Juko8),
  change(date(2019, 3, 17), <>Updated handling of <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} /> and removed its energy gained statistic as it is no longer feasible to calculate it accurately</>, Juko8),
  change(date(2019, 1, 5), 'Added tracking of time spent at maximum energy', Juko8),
  change(date(2019, 1, 2), <>Added Azerite statistic for <SpellLink id={SPELLS.FURY_OF_XUEN.id} />.</>, Juko8),
  change(date(2018, 12, 27), <>Added Azerite statistic for <SpellLink id={SPELLS.GLORY_OF_THE_DAWN.id} />.</>, Juko8),
  change(date(2018, 9, 9), 'Added Azerite statistic for Swift Roundhouse.', Juko8),
  change(date(2018, 9, 4), 'Added Azerite statistics for Iron Fists and Meridian Strikes.', Juko8),
  change(date(2018, 8, 31), 'Removed "Casts in Storm, Earth and Fire/Serenity statistics" since it\'s no longer providing accurate analysis', Juko8),
  change(date(2018, 8, 29), 'Removed legion legendaries and tiersets', Juko8),
  change(date(2018, 6, 16), <>Updated for 8.0 Battle for Azeroth prepatch. All artifact traits and related analysis removed. Bad <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> casts statistic and suggestions has been replaced with statistic and suggestions on <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon />'s new cooldown reductions mechanic </>, Juko8),
];
