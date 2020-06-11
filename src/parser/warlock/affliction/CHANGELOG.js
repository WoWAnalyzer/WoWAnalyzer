import React from 'react';

import { Chizu, Putro } from 'CONTRIBUTORS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 6, 12), 'Moved probability helpers to a shared folder.', Putro),
  change(date(2019, 3, 18), 'Updated the visuals to match new WoWAnalyzer look!', [Chizu]),
  change(date(2018, 12, 24), <>Now showing average remaining dot length on <SpellLink id={SPELLS.DEATHBOLT_TALENT.id} /> casts.</>, [Chizu]),
  change(date(2018, 12, 21), <>Added <SpellLink id={SPELLS.PANDEMIC_INVOCATION.id} /> trait and updated <SpellLink id={SPELLS.INEVITABLE_DEMISE.id} /> icon.</>, [Chizu]),
  change(date(2018, 12, 23), 'Changed display of damage in various places. Now shows % of total damage done and DPS with raw values in tooltip.', [Chizu]),
  change(date(2018, 12, 10), <>Updated for patch 8.1 - <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} /> nerf.</>, [Chizu]),
  change(date(2018, 11, 15), <>Added <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} /> to timeline as well</>, [Chizu]),
  change(date(2018, 11, 12), 'Certain buffs or debuffs now show in timeline.', [Chizu]),
  change(date(2018, 10, 15), <>Added <SpellLink id={SPELLS.VILE_TAINT_TALENT.id} />, <SpellLink id={SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id} /> and <SpellLink id={SPELLS.SHADOW_EMBRACE_TALENT.id} /> modules.</>, [Chizu]),
  change(date(2018, 10, 8), <>Added simple <SpellLink id={SPELLS.NIGHTFALL_TALENT.id} />, <SpellLink id={SPELLS.DRAIN_SOUL_TALENT.id} /> and <SpellLink id={SPELLS.PHANTOM_SINGULARITY_TALENT.id} /> modules.</>, [Chizu]),
  change(date(2018, 9, 30), <>Added <SpellLink id={SPELLS.SUMMON_DARKGLARE.id} /> module.</>, [Chizu]),
  change(date(2018, 9, 21), 'Grouped dot uptimes and talents into their respective statistic boxes.', [Chizu]),
  change(date(2018, 9, 21), 'Removed all legendaries and tier set modules.', [Chizu]),
  change(date(2018, 9, 20), <>Added <SpellLink id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} icon /> uptime module and added it into Checklist.</>, [Chizu]),
  change(date(2018, 9, 20), <>Added <SpellLink id={SPELLS.DEATHBOLT_TALENT.id} icon /> module and made updates to <SpellLink id={SPELLS.HAUNT_TALENT.id} icon /> module.</>, [Chizu]),
  change(date(2018, 6, 22), 'Updated the basics of the spec for BFA.', [Chizu]),
];
