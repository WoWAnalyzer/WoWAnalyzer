import React from 'react';

import { HawkCorrigan, niseko, mtblanton, Draenal, Vetyst } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 4, 9), <>Updated damage gained from <SpellLink id={SPELLS.FORCEFUL_WINDS_TALENT.id} />.</>, [Vetyst]),
  change(date(2020, 4, 9), <>Fixed <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> not showing up.</>, [Vetyst]),
  change(date(2020, 2, 28), <>Added a statistic for <SpellLink id={SPELLS.ANCESTRAL_RESONANCE.id} />.</>, [niseko]),
  change(date(2019, 11, 28), <>Added a statistic for <SpellLink id={SPELLS.NATURAL_HARMONY_TRAIT.id} /> to track avg crit, haste, mastery and uptime for each</>, [Draenal]),
  change(date(2019, 10, 31), <>Add a suggestion for Lightning Shield uptime</>, [HawkCorrigan]),
  change(date(2019, 11, 27), <>Add an <SpellLink id={SPELLS.EARTH_SHIELD_TALENT.id} /> statistic to track uptime and healing.</>, [Draenal]),
  change(date(2019, 10, 31), <>Add a suggestion for Totem Mastery</>, [HawkCorrigan]),
  change(date(2018, 11, 18), 'Small updates to various Enhancement spells', [mtblanton]),
  change(date(2018, 11, 4), <>Added support for <SpellLink id={SPELLS.PACK_SPIRIT_TRAIT.id} /> and <SpellLink id={SPELLS.SERENE_SPIRIT_TRAIT.id} /> azerite traits.</>, [niseko]),
  change(date(2018, 11, 1), <>Added support for <SpellLink id={SPELLS.ASTRAL_SHIFT.id} /> damage reduction.</>, [niseko]),
  change(date(2018, 10, 24), 'Added "Use your offensive cooldowns..." to the Enhancement checklist', [mtblanton]),
  change(date(2018, 10, 19), 'Added "Always be casting" to the Enhancement checklist', [mtblanton]),
  change(date(2018, 9, 16), 'Updated Enhancement Shaman for BfA.', [HawkCorrigan]),
];
