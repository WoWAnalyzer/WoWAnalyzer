import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Adoraci, Abelito75, Zeboot, LeoZhekov, Tora, Xcessiv, Tiboonn, Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import React from 'react';

export default [
  change(date(2021, 5, 16), <>Added <SpellLink id={SPELLS.DRAUGHT_OF_DEEP_FOCUS.id} /> support</>, Sref),
  change(date(2021, 5, 15), <>Improved cast detection for <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /></>, Sref),
  change(date(2021, 4, 3), 'Verified 9.0.5 patch changes and bumped support to 9.0.5', Adoraci),
  change(date(2021, 1, 16), 'Added spell information for conduits', Tiboonn),
  change(date(2020, 12, 15), <>Update Bloodtalons for Shadowlands</>, Tora),
  change(date(2020, 12, 14), <>Corrected tracking of Berserk cooldown usage.</>, Xcessiv),
  change(date(2020, 11, 6), <>Replaced the deprecated StatisticBoxes with the new Statistic and reworked SavageRoar module.</>, LeoZhekov),
  change(date(2020, 11, 5), <>Corrected event filter.</>, Abelito75),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
