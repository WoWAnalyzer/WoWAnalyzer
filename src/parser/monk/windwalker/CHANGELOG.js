import { Juko8, Abelito75 } from 'CONTRIBUTORS';

import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 10, 19), <>Add <SpellLink id={SPELLS.LAST_EMPERORS_CAPACITOR.id} /></>, Juko8),
  change(date(2020, 10, 17), <>Minor changes, <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} icon /> GCD removed, <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> CDR during Serenity updated, and cast efficiency for <SpellLink id={SPELLS.EXPEL_HARM.id} icon /> added </>, Juko8 ),
  change(date(2020, 10, 6), <>Added Fallen Order statistic.</>, Abelito75),
  change(date(2020, 9, 9), 'Updated for 9.0 Shadowlands', Juko8),
  change(date(2020, 1, 15), 'Marked as up to date for 8.3', Juko8),
  change(date(2019, 10, 14), <>Updated cooldown calculations with <SpellLink id={SPELLS.SERENITY_TALENT.id} /> and added statistic showing its effective damage increase and cooldown reductions.</>, Juko8),
  change(date(2019, 10, 1), <>Updated <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> to use stack weighted uptime.</>, Juko8),
  change(date(2019, 10, 1), <>Updated <SpellLink id={SPELLS.COMBO_STRIKES.id} /> to have more accurate thresholds for correct use.</>, Juko8),
  change(date(2019, 10, 1), <>Updated <SpellLink id={SPELLS.FISTS_OF_FURY_CAST.id} /> to lower expected average ticks when the player uses Cyclotronic Blast</>, Juko8),
  change(date(2019, 10, 1), <>Further updated analysis of <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} />. Calculations have been made more accurate and statistic now shows average enemies hit instead of average hits per cast.</>, Juko8),
  change(date(2019, 9, 12), <>Updated analysis of <SpellLink id={SPELLS.SPINNING_CRANE_KICK.id} />. Suggestions regarding bad casts were inaccurate and misleading, and have therefore been removed.</>, Juko8),
  change(date(2019, 8, 28), <>Added more support for Reverse Harm including statistic and cast efficiency suggestion </>, Juko8),
  change(date(2019, 8, 26), <>Added buffs like <SpellLink id={SPELLS.STORM_EARTH_AND_FIRE.id} /> and <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> to the timeline </>, Juko8),
  change(date(2019, 8, 20), <>Reverse Harm will now be shown correctly in the Chi overview</>, Juko8),
  change(date(2019, 8, 20), <>Updated <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> module.</>, Juko8),
  change(date(2019, 8, 18), 'Updated visuals of statistics for baseline spells', Juko8),
  change(date(2019, 3, 17), <>Updated handling of <SpellLink id={SPELLS.ENERGIZING_ELIXIR_TALENT.id} /> and removed its energy gained statistic as it is no longer feasible to calculate it accurately</>, Juko8),
  change(date(2019, 1, 5), 'Added tracking of time spent at maximum energy', Juko8),
  change(date(2019, 1, 2), 'Added Azerite statistic for Fury of Xuen.', Juko8),
  change(date(2018, 12, 27), 'Added Azerite statistic for Glory of the Dawn.', Juko8),
  change(date(2018, 9, 9), 'Added Azerite statistic for Swift Roundhouse.', Juko8),
  change(date(2018, 9, 4), 'Added Azerite statistics for Iron Fists and Meridian Strikes.', Juko8),
  change(date(2018, 8, 31), 'Removed "Casts in Storm, Earth and Fire/Serenity statistics" since it\'s no longer providing accurate analysis', Juko8),
  change(date(2018, 8, 29), 'Removed legion legendaries and tiersets', Juko8),
  change(date(2018, 6, 16), <>Updated for 8.0 Battle for Azeroth prepatch. All artifact traits and related analysis removed. Bad <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon /> casts statistic and suggestions has been replaced with statistic and suggestions on <SpellLink id={SPELLS.BLACKOUT_KICK.id} icon />'s new cooldown reductions mechanic </>, Juko8),
];
