import React from 'react';

import { Mamtooth, Yajinni } from 'CONTRIBUTORS';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2019-02-06'),
    changes: <>Added stats and suggestions for <SpellLink id={SPELLS.IMMOLATION_AURA_TALENT.id} /> and <SpellLink id={SPELLS.DEMON_BLADES_TALENT.id} />.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2019-02-03'),
    changes: <>Added stats and suggestions for level 99 talent row.</>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-08-05'),
    changes: <>Added <ItemLink id={ITEMS.SOUL_OF_THE_SLAYER.id} icon /> suggestions talents picks for BfA.</>,
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
