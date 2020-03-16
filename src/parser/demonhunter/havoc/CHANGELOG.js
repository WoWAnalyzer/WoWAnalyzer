import React from 'react';

import { Mamtooth, Yajinni, Zerotorescue, Viridis, Torothin } from 'CONTRIBUTORS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 3, 9), <>Added a <SpellLink id={SPELLS.THIRSTING_BLADES.id} /> component.</>, [Torothin]),
  change(date(2019, 8, 14), <>Added damage component for <SpellLink id={SPELLS.REVOLVING_BLADES.id} />.</>, [Viridis]),
  change(date(2019, 8, 9), <>Fixed <SpellLink id={SPELLS.FURIOUS_GAZE.id} /> occurence calculations and added statistics for bad <SpellLink id={SPELLS.FURIOUS_GAZE.id} /> casts.</>, [Viridis]),
  change(date(2019, 4, 21), <>Cleaned up the Fury usage code and added a condition for <SpellLink id={SPELLS.BLIND_FURY_TALENT.id} /> that tracks the Fury it generates and only considers Fury above 50 at the time of cast to be wasted.</>, [Yajinni]),
  change(date(2019, 4, 17), 'Added the Crucible of Storms raid to the character search and made it the default raid.', [Yajinni]),
  change(date(2019, 4, 20), 'Cleaned up the workding and formating of various analyzers in the Havoc module. Marked the spec as updated for 8.1.5.', [Yajinni]),
  change(date(2019, 4, 17), <>Added <SpellLink id={SPELLS.EYES_OF_RAGE.id} /> and <SpellLink id={SPELLS.CHAOTIC_TRANSFORMATION.id} /> azerite traits.</>, [Yajinni]),
  change(date(2019, 3, 28), <>Updated <SpellLink id={SPELLS.DEATH_SWEEP.id} /> and <SpellLink id={SPELLS.BLADE_DANCE.id} /> to share cooldowns and cast efficiencies.</>, [Yajinni]),
  change(date(2019, 3, 28), <>Added the Dont waste casts section to the checklist and rearranged a few items.</>, [Yajinni]),
  change(date(2019, 3, 28), <>Added tracking of the <SpellLink id={SPELLS.DEMONIC_TALENT.id} /> talent.</>, [Yajinni]),
  change(date(2019, 3, 12), <>Fixed an error in the <SpellLink id={SPELLS.BLIND_FURY_TALENT.id} /> analyzer.</>, [Zerotorescue]),
  change(date(2019, 2, 21), <>Added tracking of the azerite trait <SpellLink id={SPELLS.FURIOUS_GAZE.id} />.</>, [Yajinni]),
  change(date(2019, 2, 20), <>Added stats for <SpellLink id={SPELLS.MASTER_OF_THE_GLAIVE_TALENT.id} /> and <SpellLink id={SPELLS.FEL_ERUPTION_TALENT.id} /> talents.</>, [Yajinni]),
  change(date(2019, 2, 20), <>Added stats for <SpellLink id={SPELLS.DARK_SLASH_TALENT.id} /> and <SpellLink id={SPELLS.CYCLE_OF_HATRED_TALENT.id} /> talents.</>, [Yajinni]),
  change(date(2019, 2, 8), <>Large update to the checklist. Added all previous talents/suggestions that have been added from previous updates. Made the buff category hide if no <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> buff to show.</>, [Yajinni]),
  change(date(2019, 2, 8), <>Added stat for <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC_BUFF.id} /> buff uptime. Made a few small updates to abilities. Reworked the <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> module.</>, [Yajinni]),
  change(date(2019, 2, 7), <>Did a passover of all abilities and verified the correct spell id info. Added missing abilities. Updated gcds, cooldowns, suggestion thresholds/comments.</>, [Yajinni]),
  change(date(2019, 2, 7), <>Added stats for <SpellLink id={SPELLS.FEL_BARRAGE_TALENT.id} />, <SpellLink id={SPELLS.TRAIL_OF_RUIN_TALENT.id} />, and <SpellLink id={SPELLS.FEL_MASTERY_TALENT.id} /> talents.</>, [Yajinni]),
  change(date(2019, 2, 6), <>Added stats and suggestions for <SpellLink id={SPELLS.IMMOLATION_AURA_TALENT.id} /> and <SpellLink id={SPELLS.DEMON_BLADES_TALENT.id} />.</>, [Yajinni]),
  change(date(2019, 2, 3), <>Added stats and suggestions for <SpellLink id={SPELLS.BLIND_FURY_TALENT.id} />, <SpellLink id={SPELLS.DEMONIC_APPETITE_TALENT.id} />, and <SpellLink id={SPELLS.FELBLADE_TALENT.id} /> talents.</>, [Yajinni]),
  change(date(2018, 8, 5), <>Added <ItemLink id={ITEMS.SOUL_OF_THE_SLAYER.id} /> suggestions talents picks for BfA.</>, [Mamtooth]),
  change(date(2018, 8, 1), <>Implemented Checklist feature.</>, [Mamtooth]),
  change(date(2018, 7, 28), <>Inserted new BfA spells, so the Statistics tab is now up and working again.</>, [Mamtooth]),
  change(date(2018, 7, 28), <>Removed artifact spell cast suggestion.</>, [Mamtooth]),
];
