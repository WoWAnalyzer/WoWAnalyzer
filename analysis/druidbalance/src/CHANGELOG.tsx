import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Adoraci, Zeboot, LeoZhekov, Sharrq, Tiboonn, Kartarn, Ciuffi } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import React from 'react';

export default [
  change(date(2021, 4, 3), 'Verified 9.0.5 patch changes and bumped support to 9.0.5', Adoraci),
  change(date(2021, 3, 20), <> Astral Power usage efficiency now takes into consideration if <SpellLink id={SPELLS.BALANCE_OF_ALL_THINGS_SOLAR.id} /> legendary is used. </>, Kartarn),
  change(date(2021, 3, 10), 'Updated Starlord, Stellar Drift and Twin Moons talents for Shadowlands.', Kartarn),
  change(date(2021, 3, 10), <> Implemented correct wrong-cast suggestions in timeline for casting <SpellLink id={SPELLS.STARFIRE.id} /> and <SpellLink id={SPELLS.WRATH_MOONKIN.id} /> while not in the correct eclipse.</>, Kartarn),
  change(date(2021, 3, 10), <> Updated <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id} /> talent for Shadowlands and added statistic for additional gained Astral Power. </>, Kartarn),
  change(date(2021, 2, 21), 'Add modules for Starfire and Wrath to track unempowered casts', Tiboonn),
  change(date(2021, 2, 12), 'Added convoke tracking to the statistics page', Ciuffi),
  change(date(2021, 2, 13), 'Added Analyzer for utilizing Balance of All things legendary.', Kartarn),
  change(date(2021, 1, 17), 'Update balance druid spells, Change all occurences of Solar Wrath to Wrath and Lunar Strike to Starfire', Tiboonn),
  change(date(2021, 1, 16), 'Added spell information for conduits', Tiboonn),
  change(date(2020, 12, 30), 'Updated to Typescript and added Integration Tests', Sharrq),
  change(date(2020, 11, 2), 'Replaced the deprecated StatisticBoxes with the new Statistic', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
