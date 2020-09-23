import React from 'react';

import { Chizu, Gwelican, Putro } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 6, 12), 'Moved probability helpers to a shared folder.', Putro),
  change(date(2019, 4, 3), <>Add <SpellLink id={SPELLS.DEMONIC_CONSUMPTION_TALENT.id} /> power tracker. </>, [Gwelican]),
  change(date(2019, 4, 2), 'Fixed a bug where pets showed up as they were summoned before the pull.', [Gwelican]),
  change(date(2018, 12, 29), 'Fixed a bug that caused a crash when player was wearing trinket that summons pets (like Vanquished Tendril of G\'huun).', [Chizu]),
  change(date(2018, 12, 23), <>Added support for <SpellLink id={SPELLS.BALEFUL_INVOCATION.id} /> trait. Also fixed <SpellLink id={SPELLS.DEMONBOLT.id} /> icon in Soul Shard tab. </>, [Chizu]),
  change(date(2018, 12, 23), 'Changed display of damage in various places. Now shows % of total damage done and DPS with raw values in tooltip.', [Chizu]),
  change(date(2018, 12, 10), 'Updated for patch 8.1 changes.', [Chizu]),
  change(date(2018, 11, 23), <>Fixed <SpellLink id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} /> cooldown</>, [Chizu]),
  change(date(2018, 11, 19), 'Consolidated various talent boxes into one Talents statistic box.', [Chizu]),
  change(date(2018, 11, 16), <>Added <SpellLink id={SPELLS.SACRIFICED_SOULS_TALENT.id} />, <SpellLink id={SPELLS.DEMONIC_CONSUMPTION_TALENT.id} /> and <SpellLink id={SPELLS.NETHER_PORTAL_TALENT.id} /> modules.</>, [Chizu]),
  change(date(2018, 11, 16), <>Added <SpellLink id={SPELLS.SOUL_CONDUIT_TALENT.id} /> and <SpellLink id={SPELLS.INNER_DEMONS_TALENT.id} /> modules. Fixed the Pet Timeline if it encounters an unknown pet.</>, [Chizu]),
  change(date(2018, 11, 16), <>Added talent modules for <SpellLink id={SPELLS.FROM_THE_SHADOWS_TALENT.id} />, <SpellLink id={SPELLS.SOUL_STRIKE_TALENT.id} /> and <SpellLink id={SPELLS.SUMMON_VILEFIEND_TALENT.id} />.</>, [Chizu]),
  change(date(2018, 11, 15), <>Added <SpellLink id={SPELLS.POWER_SIPHON_TALENT.id} /> talent module and modified <SpellLink id={SPELLS.DOOM_TALENT.id} /> module to also show damage done by the talent.</>, [Chizu]),
  change(date(2018, 11, 15), <>Updated Checklist rules and added talent modules for the first row - <SpellLink id={SPELLS.DREADLASH_TALENT.id} />, <SpellLink id={SPELLS.DEMONIC_STRENGTH_TALENT.id} /> and <SpellLink id={SPELLS.BILESCOURGE_BOMBERS_TALENT.id} /></>, [Chizu]),
  change(date(2018, 11, 15), <>Fixed <SpellLink id={SPELLS.DEMONIC_CALLING_TALENT.id} /> and <SpellLink id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} /> modules.</>, [Chizu]),
  change(date(2018, 11, 12), 'Certain buffs or debuffs now show in timeline.', [Chizu]),
  change(date(2018, 11, 10), <>Added a Pet Timeline tab, allowing you to see your demons' lifespans and highlighting important casts, such as <SpellLink id={SPELLS.NETHER_PORTAL_TALENT.id} />, <SpellLink id={SPELLS.SUMMON_DEMONIC_TYRANT.id} /> and <SpellLink id={SPELLS.IMPLOSION_CAST.id} />.</>, [Chizu]),
  change(date(2018, 11, 8), <>Reworked pet tracking system, fixed <SpellLink id={SPELLS.GRIMOIRE_FELGUARD_TALENT.id} /> talent module.</>, [Chizu]),
  change(date(2018, 9, 21), 'Removed all legendaries and tier set modules.', [Chizu]),
];
