import React from 'react';

import { Abelito75, Zeboot, LeoZhekov, Tora, Xcessiv, Tiboonn } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2021, 1, 16), 'Added spell information for conduits', Tiboonn),
  change(date(2020, 12, 15), <>Update Bloodtalons for Shadowlands</>, Tora),
  change(date(2020, 12, 14), <>Corrected tracking of Berserk cooldown usage.</>, Xcessiv),
  change(date(2020, 11, 6), <>Replaced the deprecated StatisticBoxes with the new Statistic and reworked SavageRoar module.</>, LeoZhekov),
  change(date(2020, 11, 5), <>Corrected event filter.</>, Abelito75),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
