import React from 'react';

import { joshinator, Yajinni } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-09-28'),
    changes: <>Updated the <SpellLink id={SPELLS.MARROWREND.id} />-usage module to account for <SpellLink id={SPELLS.BONES_OF_THE_DAMNED.id} /> and updated <SpellLink id={SPELLS.HEARTBREAKER_TALENT.id} />-Module.</>,
    contributors: [joshinator],
    clIndex: 'Blood20180928.1',
  },
  {
    date: new Date('2018-08-03'),
    changes: <>Added <SpellLink id={SPELLS.BONE_SPIKE_GRAVEYARD.id} />-Module.</>,
    contributors: [joshinator],
    clIndex: 'Blood20180803.1',
  },
  {
    date: new Date('2018-08-01'),
    changes: <>Added <SpellLink id={SPELLS.BONES_OF_THE_DAMNED.id} />-Module.</>,
    contributors: [joshinator],
    clIndex: 'Blood20180801.1',
  },
  {
    date: new Date('2018-07-19'),
    changes: <>Updated <SpellLink id={SPELLS.FOUL_BULWARK_TALENT.id} /> to its new reduced value.</>,
    contributors: [Yajinni],
    clIndex: 'Blood20180719.1',
  },
  {
    date: new Date('2018-07-18'),
    changes: <>Removed old legion traits/talents/abilities.</>,
    contributors: [Yajinni],
    clIndex: 'Blood20180718.1',
  },
];
