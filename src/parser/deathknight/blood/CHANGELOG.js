import React from 'react';

import { joshinator, Yajinni } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

export default [
  {
    date: new Date('2018-09-28'),
    changes: <React.Fragment>Updated the <SpellLink id={SPELLS.MARROWREND.id} />-usage module to account for <SpellLink id={SPELLS.BONES_OF_THE_DAMNED.id} /> and updated <SpellLink id={SPELLS.HEARTBREAKER_TALENT.id} />-Module.</React.Fragment>,
    contributors: [joshinator],
  },
  {
    date: new Date('2018-08-03'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.BONE_SPIKE_GRAVEYARD.id} />-Module.</React.Fragment>,
    contributors: [joshinator],
  },
  {
    date: new Date('2018-08-01'),
    changes: <React.Fragment>Added <SpellLink id={SPELLS.BONES_OF_THE_DAMNED.id} />-Module.</React.Fragment>,
    contributors: [joshinator],
  },
  {
    date: new Date('2018-07-19'),
    changes: <React.Fragment>Updated <SpellLink id={SPELLS.FOUL_BULWARK_TALENT.id} /> to its new reduced value.</React.Fragment>,
    contributors: [Yajinni],
  },
  {
    date: new Date('2018-07-18'),
    changes: <React.Fragment>Removed old legion traits/talents/abilities.</React.Fragment>,
    contributors: [Yajinni],
  },
];
