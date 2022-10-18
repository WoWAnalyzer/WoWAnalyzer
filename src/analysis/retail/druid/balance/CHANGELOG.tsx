import { change, date } from 'common/changelog';
import SPELLS from 'common/SPELLS';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Zeboot, LeoZhekov, Sharrq, Tiboonn, Kartarn, Ciuffi, Sref, ToppleTheNun } from 'CONTRIBUTORS';
import { SpellLink } from 'interface';

export default [
  change(date(2022, 10, 17), <>Add <SpellLink id={TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT} /> to Abilities list.</>, ToppleTheNun),
  change(date(2022, 9, 16), <>Initial updates for Dragonflight Talent system.</>, Sref),
  change(date(2022, 7, 6), <>Bumped version to indicate 9.2.5 is supported.</>, Sref),
  change(date(2022, 6, 19), <>Rolled DoT uptimes into an uptime graph. Added notional damage amount to <SpellLink id={SPELLS.CONVOKE_SPIRITS.id}/> statistic.</>, Sref),
  change(date(2022, 6, 16), <>Added <SpellLink id={SPELLS.RAVENOUS_FRENZY.id}/> to Timeline.</>, Sref),
  change(date(2022, 5, 12), <>Updated to indicate this spec is supported for patch 9.2, and also fixed handling of <SpellLink id={SPELLS.ADAPTIVE_SWARM.id}/></>, Sref),
  change(date(2021, 11, 12), <>Updated to indicate this spec is supported for patch 9.1.5</>, Sref),
  change(date(2021, 8, 3), <>Updated to indicate this spec is supported for patch 9.1</>, Sref),
  change(date(2021, 8, 2), <>Fixed a bug that was causing <SpellLink id={SPELLS.HALF_MOON.id}/> casts to be missed by the analyzer.</>, Sref),
  change(date(2021, 7, 28), <>Fixed incorrect haste number for <SpellLink id={SPELLS.RAVENOUS_FRENZY.id}/>.</>, Sref),
  change(date(2021, 7, 25), <>Added proper haste tracking for <SpellLink id={SPELLS.RAVENOUS_FRENZY.id}/> and <SpellLink id={SPELLS.SINFUL_HYSTERIA.id}/>.</>, Sref),
  change(date(2021, 7, 10), <>Fixed a bug where <SpellLink id={SPELLS.STARSURGE_MOONKIN.id} /> usage wasn't being correctly tracked and another where <SpellLink id={TALENTS_DRUID.NEW_MOON_TALENT.id} /> had the wrong cooldown.</>, Sref),
  change(date(2021, 6, 30), <>Added missing minor abilities to tracking.</>, Sref),
  change(date(2021, 6, 30), <>Consolidated DoT sections of checklist, and added new <SpellLink id={SPELLS.ECLIPSE.id} /> section.</>, Sref),
  change(date(2021, 6, 26), <>Added myself as a spec maintainer and bumped support level to 'full'. Added checklist items for <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} />, <SpellLink id={SPELLS.ADAPTIVE_SWARM.id} />, and <SpellLink id={SPELLS.RAVENOUS_FRENZY.id} /></>, Sref),
  change(date(2021, 5, 15), <>Improved cast detection for <SpellLink id={SPELLS.CONVOKE_SPIRITS.id} /></>, Sref),
  change(date(2021, 4, 2), 'Updated \'About\' page for Shadowlands and current state of the spec\'s analyzer.', Kartarn),
  change(date(2021, 3, 20), <> Astral Power usage efficiency now takes into consideration if <SpellLink id={SPELLS.BALANCE_OF_ALL_THINGS_SOLAR.id} /> legendary is used. </>, Kartarn),
  change(date(2021, 3, 10), 'Updated Starlord, Stellar Drift and Twin Moons talents for Shadowlands.', Kartarn),
  change(date(2021, 3, 10), <> Implemented correct wrong-cast suggestions in timeline for casting <SpellLink id={SPELLS.STARFIRE.id} /> and <SpellLink id={SPELLS.WRATH_MOONKIN.id} /> while not in the correct eclipse.</>, Kartarn),
  change(date(2021, 3, 10), <> Updated <SpellLink id={TALENTS_DRUID.SOUL_OF_THE_FOREST_BALANCE_TALENT.id} /> talent for Shadowlands and added statistic for additional gained Astral Power. </>, Kartarn),
  change(date(2021, 2, 21), 'Add modules for Starfire and Wrath to track unempowered casts', Tiboonn),
  change(date(2021, 2, 12), 'Added convoke tracking to the statistics page', Ciuffi),
  change(date(2021, 2, 13), 'Added Analyzer for utilizing Balance of All things legendary.', Kartarn),
  change(date(2021, 1, 17), 'Update balance druid spells, Change all occurences of Solar Wrath to Wrath and Lunar Strike to Starfire', Tiboonn),
  change(date(2021, 1, 16), 'Added spell information for conduits', Tiboonn),
  change(date(2020, 12, 30), 'Updated to Typescript and added Integration Tests', Sharrq),
  change(date(2020, 11, 2), 'Replaced the deprecated StatisticBoxes with the new Statistic', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
