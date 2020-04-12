import React from 'react';

import { niseko, HawkCorrigan, Draenal, TheJigglr } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 3, 17), <>Adjust wording of downtime suggestion. Cancelled casts don't consume a gcd.</>, [Draenal]),
  change(date(2020, 2, 28), <>Added a statistic for <SpellLink id={SPELLS.ANCESTRAL_RESONANCE.id} />.</>, [niseko]),
  change(date(2019, 11, 29), <>Add a statistic counting the amount of maelstrom not wasted due to <SpellLink id={SPELLS.CALL_THE_THUNDER_TALENT.id} />.</>, [Draenal]),
  change(date(2019, 11, 28), <>Added a statistic for <SpellLink id={SPELLS.NATURAL_HARMONY_TRAIT.id} /> to track avg crit, haste, mastery and uptime for each</>, [Draenal]),
  change(date(2019, 11, 27), <>Add an <SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} /> statistic to track uptime and healing.</>, [Draenal]),
  change(date(2019, 10, 31), <>Add a checklist item for <SpellLink id={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id} /></>, [HawkCorrigan] ),
  change(date(2019, 10, 31), <>Fixed formatting for SoP suggestion</>, [HawkCorrigan]),
  change(date(2019, 10, 26), <>Add a checklist item for <SpellLink id={SPELLS.TOTEM_MASTERY_TALENT_ELEMENTAL.id} /> uptime.</>, [Draenal]),
  change(date(2019, 10, 21), <>Add a checklist item for <SpellLink id={SPELLS.FLAME_SHOCK.id} /> uptime and early refreshes.</>, [Draenal]),
  change(date(2019, 10, 16), <>Count precast <SpellLink id={SPELLS.STORMKEEPER_TALENT.id} /> in total number of <SpellLink id={SPELLS.STORMKEEPER_TALENT.id} /> casts.</>, [TheJigglr]),
  change(date(2019, 10, 12), <>Add suggestion and checklist for Icefury efficiency.</>, [Draenal]),
  change(date(2019, 10, 12), <>Added cancelled casts to downtime checklist. Add cancelled casts suggestion.</>, [Draenal]),
  change(date(2019, 8, 21), <>Added support for <SpellLink id={SPELLS.SURGE_OF_POWER_TALENT.id} /></>, [TheJigglr]),
  change(date(2019, 8, 14), <>Updated <SpellLink id={SPELLS.LAVA_BURST.id} /> to check for <SpellLink id={SPELLS.FLAME_SHOCK.id} /> on damage instead of on cast.</>, [Draenal]),
  change(date(2019, 5, 6), <>Added support for the damage part of <SpellLink id={SPELLS.IGNEOUS_POTENTIAL.id} />.</>, [niseko]),
  change(date(2019, 3, 20), <>Fixing <SpellLink id={SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id} />-Tracker and Damage Calculation.</>, [HawkCorrigan]),
  change(date(2018, 11, 13), <>Added a basic Checklist, with the cross-spec functionalities.</>, [HawkCorrigan]),
  change(date(2018, 11, 4), <>Added support for <SpellLink id={SPELLS.PACK_SPIRIT_TRAIT.id} /> and <SpellLink id={SPELLS.SERENE_SPIRIT_TRAIT.id} /> azerite traits.</>, [niseko]),
  change(date(2018, 11, 1), <>Added support for <SpellLink id={SPELLS.ASTRAL_SHIFT.id} /> damage reduction.</>, [niseko]),
  change(date(2018, 10, 17), <>Flagged the Elemental Shaman Analyzer as supported.</>, [HawkCorrigan]),
  change(date(2018, 10, 15), <>Added Checks for the correct usage of <SpellLink id={SPELLS.STORM_ELEMENTAL_TALENT.id} /> and <SpellLink id={SPELLS.FIRE_ELEMENTAL.id} /> when talented into <SpellLink id={SPELLS.PRIMAL_ELEMENTALIST_TALENT.id} />.</>, [HawkCorrigan]),
];
