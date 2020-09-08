import React from 'react';

import { Sharrq, Dambroda, jos3p } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 7, 2), <>Fixed bug for <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> for NoIL.</>, [Sharrq]),
  change(date(2020, 6, 19), 'Updated backend Frost constants for easier maintenance.', [Sharrq]),
  change(date(2020, 6, 3), <>Fixed <SpellLink id={SPELLS.THERMAL_VOID_TALENT.id} /> statistic icon and <SpellLink id={SPELLS.SPLITTING_ICE_TALENT.id} /> typo.</>, [Dambroda]),
  change(date(2020, 6, 1), <>Fixed <SpellLink id={SPELLS.ICY_VEINS.id} /> pre-pull detection.</>, [Dambroda]),
  change(date(2020, 5, 25), <>Updated Integration Tests and Example Logs.</>,[Sharrq]),
  change(date(2020, 5, 25), <>Updated remaining files to Typescript.</>,[Sharrq]),
  change(date(2020, 5, 12), <>Updated modules to Typescript and Event Listeners.</>,[Sharrq]),
  change(date(2020, 4, 24), <>Fixed a bug in <SpellLink id={SPELLS.BRAIN_FREEZE.id} /> for the No Ice Lance Build that resulted in the module being disabled.</>,[Sharrq]),
  change(date(2020, 1, 15), <>Updated <SpellLink id={SPELLS.FINGERS_OF_FROST.id} /> proc usage for NoIL and compatibility to 8.3.</>,[Sharrq]),
  change(date(2019, 11, 14), 'Added support for the NoIL Build.',[Sharrq]),
  change(date(2019, 9, 30), 'Updated Spec Compatibility to 8.2.5.',[Sharrq]),
  change(date(2019, 8, 6), 'Updated spec compatibility to 8.2.', [Sharrq]),
  change(date(2019, 3, 18), 'Updated statistic boxes to new layout.', [Sharrq]),
  change(date(2019, 3, 14), 'Updated spec compatibility to 8.1.5.', [Sharrq]),
  change(date(2019, 3, 2), 'Added spec buffs to the timeline.', [Sharrq]),
  change(date(2019, 2, 18), 'Updated Checklist to better explain the primary aspects of the Frost Rotation.', [Sharrq]),
  change(date(2018, 12, 16), 'Updated for Patch 8.1.', [Sharrq]),
  change(date(2018, 11, 27), <>Removed <SpellLink id={SPELLS.THERMAL_VOID_TALENT.id} /> from checklist and updated the module to better show what the talent provides.</>, [Dambroda]),
  change(date(2018, 11, 24), <>Added a statistics module for <SpellLink id={SPELLS.LONELY_WINTER_TALENT.id} />.</>, [Dambroda]),
  change(date(2018, 11, 18), <>Removed <SpellLink id={SPELLS.BONE_CHILLING_TALENT.id} /> uptime from checklist and updated the module to calculate damage instead of uptime.</>, [Dambroda]),
  change(date(2018, 10, 29), <>Rewrote <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> module. Inefficient casts are now shown in timeline.</>, [Dambroda]),
  change(date(2018, 10, 28), <>Added statistics and checklist entry for <SpellLink id={SPELLS.SUMMON_WATER_ELEMENTAL.id} /> if talented.</>, [jos3p]),
  change(date(2018, 9, 21), <>Added statistics for <SpellLink id={SPELLS.WHITEOUT.id} /></>, [Dambroda]),
  change(date(2018, 9, 10), <>Updated Checklist, Better <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> Support, Added Support for <SpellLink id={SPELLS.BONE_CHILLING_TALENT.id} /></>, [Sharrq]),
  change(date(2018, 8, 28), <>Added support for Winter's Reach and <SpellLink id={SPELLS.WHITEOUT.id} /></>, [Sharrq]),
  change(date(2018, 8, 11), <>Updated for Level 120</>, [Sharrq]),
  change(date(2018, 6, 10), <>Updated for 8.0 Prepatch</>, [Sharrq]),
];
