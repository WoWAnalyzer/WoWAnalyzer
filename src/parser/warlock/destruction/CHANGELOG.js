import React from 'react';

import { Chizu, Putro } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 6, 12), 'Moved probability helpers to a shared folder.', Putro),
  change(date(2019, 3, 18), 'Updated the visuals to match new WoWAnalyzer look!', [Chizu]),
  change(date(2018, 12, 23), <>Added <SpellLink id={SPELLS.CHAOS_SHARDS.id} /> trait.</>, [Chizu]),
  change(date(2018, 12, 23), 'Changed display of damage in various places. Now shows % of total damage done and DPS with raw values in tooltip.', [Chizu]),
  change(date(2018, 11, 12), 'Certain buffs or debuffs now show in timeline.', [Chizu]),
  change(date(2018, 11, 4), <>Added <SpellLink id={SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id} /> module, damage estimate to <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} /> and moved <SpellLink id={SPELLS.ERADICATION_TALENT.id} /> to the rest of the talents.</>, [Chizu]),
  change(date(2018, 11, 4), <>Added <SpellLink id={SPELLS.INFERNO_TALENT.id} /> and <SpellLink id={SPELLS.ROARING_BLAZE_TALENT.id} /> talent modules.</>, [Chizu]),
  change(date(2018, 11, 4), <>Added <SpellLink id={SPELLS.INTERNAL_COMBUSTION_TALENT.id} /> and <SpellLink id={SPELLS.SHADOWBURN_TALENT.id} /> talent modules.</>, [Chizu]),
  change(date(2018, 11, 4), <>Added <SpellLink id={SPELLS.FLASHOVER_TALENT.id} /> and <SpellLink id={SPELLS.SOUL_FIRE_TALENT.id} /> talent modules.</>, [Chizu]),
  change(date(2018, 11, 3), 'Implemented Checklist for Destruction Warlocks.', [Chizu]),
  change(date(2018, 11, 2), <>Added modules tracking <SpellLink id={SPELLS.CATACLYSM_TALENT.id} /> and <SpellLink id={SPELLS.RAIN_OF_FIRE_CAST.id} /> effectiveness (average targets hit).</>, [Chizu]),
  change(date(2018, 11, 2), <><SpellLink id={SPELLS.FIRE_AND_BRIMSTONE_TALENT.id} /> should now correctly track bonus fragments and cleaved damage again.</>, [Chizu]),
  change(date(2018, 10, 2), <>Fixed <SpellLink id={SPELLS.ERADICATION_TALENT.id} /> to snapshot the debuff on cast instead of damage.</>, [Chizu]),
  change(date(2018, 10, 2), <>Added <SpellLink id={SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id} /> stack tracker.</>, [Chizu]),
  change(date(2018, 10, 1), <>Added <SpellLink id={SPELLS.REVERSE_ENTROPY_TALENT.id} /> uptime tracking.</>, [Chizu]),
  change(date(2018, 9, 21), 'Removed all legendaries and tier set modules.', [Chizu]),
  change(date(2018, 6, 25), 'Updated the basics of the spec for BFA. Reworked Soul Shard Fragment tracking.', [Chizu]),
];
