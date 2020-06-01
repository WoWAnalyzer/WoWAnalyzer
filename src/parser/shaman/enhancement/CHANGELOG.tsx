import React from 'react';

import { HawkCorrigan, niseko, mtblanton, Draenal, Vetyst } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 6, 1), <>Added <strong>Maintain your buffs</strong> checklist rule.</>, [Vetyst]),
  change(date(2020, 5, 27), <>Corrected damage gains of <SpellLink id={SPELLS.ROILING_STORM.id} /> and <SpellLink id={SPELLS.THUNDERAANS_FURY.id} />, they now scale with stats.</>, [Vetyst]),
  change(date(2020, 5, 25), <>Converted remaining Enhancement Shaman files to typescript and cleaned its modules.</>, [Vetyst]),
  change(date(2020, 4, 20), <>Updated <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> suggestion and damage display.</>, [Vetyst]),
  change(date(2020, 4, 14), <>Showing primary buffs on the timeline.</>, [Vetyst]),
  change(date(2020, 4, 14), <>Added damage statistiscs for <SpellLink id={SPELLS.STRENGTH_OF_EARTH_TRAIT.id} />.</>, [Vetyst]),
  change(date(2020, 4, 13), <>Added damage statistiscs for <SpellLink id={SPELLS.BOULDERFIST_TALENT.id} />.</>, [Vetyst]),
  change(date(2020, 4, 13), <>Added damage statistiscs for <SpellLink id={SPELLS.PRIMAL_PRIMER_TRAIT.id} />.</>, [Vetyst]),
  change(date(2020, 4, 13), <>Added damage statistiscs for <SpellLink id={SPELLS.LIGHTNING_CONDUIT_TRAIT.id} />.</>, [Vetyst]),
  change(date(2020, 4, 13), <>Added <SpellLink id={SPELLS.STORMSTRIKE_CAST.id} /> damage statistiscs for <SpellLink id={SPELLS.THUNDERAANS_FURY.id} />.</>, [Vetyst]),
  change(date(2020, 4, 13), <>Added damage statistics for <SpellLink id={SPELLS.ROILING_STORM.id} />.</>, [Vetyst]),
  change(date(2020, 4, 12), <>Added healing statistics for <SpellLink id={SPELLS.NATURES_GUARDIAN_TALENT.id} />.</>, [Vetyst]),
  change(date(2020, 4, 11), <>Added a statistic and suggestion for <SpellLink id={SPELLS.STORMBRINGER.id} />.</>, [Vetyst]),
  change(date(2020, 4, 10), 'Updated spell list to match 8.3 for Enhancement Shaman.', [Vetyst]),
  change(date(2020, 4, 9), <>Updated damage gained from <SpellLink id={SPELLS.FORCEFUL_WINDS_TALENT.id} />.</>, [Vetyst]),
  change(date(2020, 4, 9), <>Fixed <SpellLink id={SPELLS.LIGHTNING_SHIELD_TALENT.id} /> not showing up.</>, [Vetyst]),
  change(date(2020, 3, 2), <>Updated all modules to typescript and modern Modules</>, [HawkCorrigan]),
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
