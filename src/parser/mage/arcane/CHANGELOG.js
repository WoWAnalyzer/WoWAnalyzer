import React from 'react';

import { Sharrq, fluffels } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 1, 15), 'Updated Spec Compatibility to 8.3',[Sharrq]),
  change(date(2019, 10, 1), <>Removed the check to see if <SpellLink id={SPELLS.ARCANE_POWER.id} /> was available when the fight ended.</>,[Sharrq]),
  change(date(2019, 9, 30), 'Updated Spec Compatibility to 8.2.5.',[Sharrq]),
  change(date(2019, 9, 16), 'Fix a bug where arcane mage mana graph would not show time labels correctly.', fluffels),
  change(date(2019, 8, 6), 'Updated spec compatibility to 8.2.', [Sharrq]),
  change(date(2019, 3, 14), 'Updated spec compatibility to 8.1.5.', [Sharrq]),
  change(date(2019, 3, 2), 'Added spec buffs to the timeline.', [Sharrq]),
  change(date(2018, 12, 16), 'Updated for Patch 8.1.', [Sharrq]),
  change(date(2018, 10, 11), <>Fixed <SpellLink id={SPELLS.ARCANE_CHARGE.id} /> Normalizer to not put energize events after <SpellLink id={SPELLS.ARCANE_BARRAGE.id} /> and added Normalizer to sort the <SpellLink id={SPELLS.ARCANE_POWER.id} /> cast before the buff application</>, [Sharrq]),
  change(date(2018, 10, 11), <>Redid <SpellLink id={SPELLS.ARCANE_POWER.id} /> Utilization to count each pre-req separately. Also updated tooltip and suggestion to show which checks were failed.</>, [Sharrq]),
  change(date(2018, 10, 11), <>Fixed <SpellLink id={SPELLS.RULE_OF_THREES_TALENT.id} /> bug</>, [Sharrq]),
  change(date(2018, 8, 28), <>Added support for <SpellLink id={SPELLS.GALVANIZING_SPARK.id} /> and Anomalous Impact.</>, [Sharrq]),
  change(date(2018, 8, 11), <>Added <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> Module and <SpellLink id={SPELLS.TIME_ANOMALY_TALENT.id} /> Mana Management.</>, [Sharrq]),
  change(date(2018, 8, 10), <>Added Check to see if the player went OOM during <SpellLink id={SPELLS.ARCANE_POWER.id} />.</>, [Sharrq]),
  change(date(2018, 8, 9), 'Added Checklist', [Sharrq]),
  change(date(2018, 8, 2), <>Removed <SpellLink id={SPELLS.ARCANE_MISSILES.id} /> module as it is no longer relevant. Also fixed Arcane Charge event order.</>, [Sharrq]),
  change(date(2018, 8, 1), <>Added Support for <SpellLink id={SPELLS.RULE_OF_THREES_TALENT.id} />.</>, [Sharrq]),
  change(date(2018, 7, 28), <>Added Support for <SpellLink id={SPELLS.ARCANE_POWER.id} />.</>, [Sharrq]),
  change(date(2018, 7, 25), 'Added Arcane Charge Tracking and Mana Chart.', [Sharrq]),
  change(date(2018, 7, 23), <>Added Support for <SpellLink id={SPELLS.ARCANE_FAMILIAR_TALENT.id} />, <SpellLink id={SPELLS.ARCANE_ORB_TALENT.id} />, and <SpellLink id={SPELLS.ARCANE_INTELLECT.id} />.</>, [Sharrq]),
  change(date(2018, 7, 23), <>Removed <SpellLink id={SPELLS.EVOCATION.id} /> Suggestion, Updated for 8.0.1, Resolved some Abilities Bugs</>, [Sharrq]),
];
