import React from 'react';

import { Mamtooth, Yajinni, Zerotorescue } from 'CONTRIBUTORS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2019-04-21'),
    changes: <>Cleaned up the Fury usage code and added a condition for <SpellLink id={SPELLS.BLIND_FURY_TALENT.id} /> that tracks the Fury it generates and only considers Fury above 50 at the time of cast to be wasted.</>,
    contributors: [Yajinni],
  {
    date: new Date('2019-04-17'),
    changes: 'Added the Crucible of Storms raid to the character search and made it the default raid.',
    contributors: [Yajinni],
  },
    date: new Date('2019-04-20'),
    changes: 'Cleaned up the workding and formating of various analyzers in the Havoc module. Marked the spec as updated for 8.1.5.',
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-04-17'),
    changes: <>Added <SpellLink id={SPELLS.EYES_OF_RAGE.id} /> and <SpellLink id={SPELLS.CHAOTIC_TRANSFORMATION.id} /> azerite traits.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-03-28'),
    changes: <>Updated <SpellLink id={SPELLS.DEATH_SWEEP.id} /> and <SpellLink id={SPELLS.BLADE_DANCE.id} /> to share cooldowns and cast efficiencies.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-03-28'),
    changes: <>Added the Dont waste casts section to the checklist and rearranged a few items.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-03-28'),
    changes: <>Added tracking of the <SpellLink id={SPELLS.DEMONIC_TALENT.id} /> talent.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-03-12'),
    changes: <>Fixed an error in the <SpellLink id={SPELLS.BLIND_FURY_TALENT.id} /> analyzer.</>,
    contributors: [Zerotorescue],
  },
  {
    date: new Date('2019-02-21'),
    changes: <>Added tracking of the azerite trait <SpellLink id={SPELLS.FURIOUS_GAZE.id} />.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-02-20'),
    changes: <>Added stats for <SpellLink id={SPELLS.MASTER_OF_THE_GLAIVE_TALENT.id} /> and <SpellLink id={SPELLS.FEL_ERUPTION_TALENT.id} /> talents.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-02-20'),
    changes: <>Added stats for <SpellLink id={SPELLS.DARK_SLASH_TALENT.id} /> and <SpellLink id={SPELLS.CYCLE_OF_HATRED_TALENT.id} /> talents.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-02-08'),
    changes: <>Large update to the checklist. Added all previous talents/suggestions that have been added from previous updates. Made the buff category hide if no <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> buff to show.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-02-08'),
    changes: <>Added stat for <SpellLink id={SPELLS.METAMORPHOSIS_HAVOC_BUFF.id} /> buff uptime. Made a few small updates to abilities. Reworked the <SpellLink id={SPELLS.MOMENTUM_TALENT.id} /> module.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-02-07'),
    changes: <>Did a passover of all abilities and verified the correct spell id info. Added missing abilities. Updated gcds, cooldowns, suggestion thresholds/comments.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-02-07'),
    changes: <>Added stats for <SpellLink id={SPELLS.FEL_BARRAGE_TALENT.id} />, <SpellLink id={SPELLS.TRAIL_OF_RUIN_TALENT.id} />, and <SpellLink id={SPELLS.FEL_MASTERY_TALENT.id} /> talents.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-02-06'),
    changes: <>Added stats and suggestions for <SpellLink id={SPELLS.IMMOLATION_AURA_TALENT.id} /> and <SpellLink id={SPELLS.DEMON_BLADES_TALENT.id} />.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-02-03'),
    changes: <>Added stats and suggestions for <SpellLink id={SPELLS.BLIND_FURY_TALENT.id} />, <SpellLink id={SPELLS.DEMONIC_APPETITE_TALENT.id} />, and <SpellLink id={SPELLS.FELBLADE_TALENT.id} /> talents.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-08-05'),
    changes: <>Added <ItemLink id={ITEMS.SOUL_OF_THE_SLAYER.id} /> suggestions talents picks for BfA.</>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-08-01'),
    changes: <>Implemented Checklist feature.</>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-07-28'),
    changes: <>Inserted new BfA spells, so the Statistics tab is now up and working again.</>,
    contributors: [Mamtooth],
  },
  {
    date: new Date('2018-07-28'),
    changes: <>Removed artifact spell cast suggestion.</>,
    contributors: [Mamtooth],
  },
];
