import React from 'react';

import { Salarissia, joshinator } from 'CONTRIBUTORS';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-05-10'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.BOOMING_VOICE_TALENT.id} />, <SpellLink id={SPELLS.RENEWED_FURY_TALENT.id} />, reordered and added buffs to the timeline and added <SpellLink id={SPELLS.SHIELD_SLAM.id} /> resets (not 100% accurate).</React.Fragment>,
    contributors: [joshinator],
  },
  {
    date: new Date('2018-05-10'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.ANGER_MANAGEMENT_TALENT.id} />, <ItemLink id={ITEMS.THUNDERGODS_VIGOR.id} /> and <SpellLink id={SPELLS.PROTECTION_WARRIOR_T21_2P_WALL_OF_IRON.id} /> support.</React.Fragment>,
    contributors: [joshinator],
  },
  {
    date: new Date('2017-09-22'),
    changes: 'Added basic support.',
    contributors: [Salarissia],
  },
];
