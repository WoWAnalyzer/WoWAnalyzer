import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { Adoraci, Abelito75, Zeboot, LeoZhekov, Tora, Xcessiv, Tiboonn, Sref } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';
import React from 'react';

export default [
  change(date(2021, 7, 28), <>Energy overcap from <SpellLink id={SPELLS.TIGERS_FURY.id}/> and Combo Point overcap stats no longer count waste that occurs during <SpellLink id={SPELLS.CONVOKE_SPIRITS.id}/>, as it is unavoidable.</>, Sref),
  change(date(2021, 7, 25), <>Added proper haste tracking for <SpellLink id={SPELLS.RAVENOUS_FRENZY.id}/> and <SpellLink id={SPELLS.SINFUL_HYSTERIA.id}/>.</>, Sref),
  change(date(2021, 7, 10), <>Removed outdated "<SpellLink id={SPELLS.BLOODTALONS_BUFF.id}/> overwrite" suggestion, and updated the statistic box to be more useful.</>, Sref),
  change(date(2021, 7, 9), <>Fixed an issue where only <SpellLink id={SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id} /> (and not <SpellLink id={SPELLS.BERSERK.id} />) was counted as giving a stealth bonus to <SpellLink id={SPELLS.RAKE.id} /></>, Sref),
  change(date(2021, 6, 26), <>Added <SpellLink id={SPELLS.RAVENOUS_FRENZY.id}/> to CDs checklist, and fixed a bug where <SpellLink id={SPELLS.ADAPTIVE_SWARM.id}/> stats would only appear if player is specced for <SpellLink id={SPELLS.LUNAR_INSPIRATION_TALENT.id}/>.</>, Sref),
  change(date(2021, 6, 25), <>Added suggestions for <SpellLink id={SPELLS.TIGERS_FURY.id} /> and <SpellLink id={SPELLS.BLOODTALONS_TALENT.id} /> snapshotting, and updated <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> energy suggestion to be more clear about exceptions.</>, Sref),
  change(date(2021, 6, 24), <>Complete overhaul of the Checklist, including many bugfixes and improvements.</>, Sref),
  change(date(2021, 6, 3), <>Added <SpellLink id={SPELLS.APEX_PREDATORS_CRAVING.id} /> support</>, Sref),
  change(date(2021, 6, 1), <>Fixed an issue where <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /> stat box wasn't showing, and updated it to show direct damage done.</>, Sref),
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
