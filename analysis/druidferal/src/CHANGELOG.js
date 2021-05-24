import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Adoraci, Abelito75, Zeboot, LeoZhekov, Tora, Xcessiv, Tiboonn, Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import React from 'react';

export default [
  change(date(2021, 5, 24), <>Rolled snapshot uptimes into the uptimes graph. Added a statistic for <SpellLink id={SPELLS.ADAPTIVE_SWARM.id}/>.</>, Sref),
  change(date(2021, 5, 22), <>Fixed a bug where <SpellLink id={SPELLS.HEART_OF_THE_WILD_TALENT.id} /> cast efficiency wasn't showing properly.</>, Sref),
  change(date(2021, 5, 19), <>Added myself as maintainer and removed 'partial support' label. Updated appearance of uptime statistics.</>, Sref),
  change(date(2021, 5, 18), <>Added <SpellLink id={SPELLS.FRENZYBAND.id} /> support</>, Sref),
  change(date(2021, 5, 18), <>Fixed a bug where <SpellLink id={SPELLS.MOONFIRE_FERAL.id} /> snapshots weren't showing correctly</>, Sref),
  change(date(2021, 5, 17), 'Fixed confusing display of energy wasted statistic / suggestion', Sref),
  change(date(2021, 5, 17), <>Updated the Checklist to include <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> and <SpellLink id={SPELLS.HEART_OF_THE_WILD_TALENT.id} /> cast efficiency
    and <SpellLink id={SPELLS.ADAPTIVE_SWARM.id} /> uptime. Fixed an issue where <SpellLink id={SPELLS.BERSERK_BUFF.id} /> showed incorrectly in the Combo Points tab.</>, Sref),
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
