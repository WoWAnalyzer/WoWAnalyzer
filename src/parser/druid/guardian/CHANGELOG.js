import React from 'react';

import { Yajinni} from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  {
    date: new Date('2018-08-09'),
    changes: <>Fixed <SpellLink id={SPELLS.IRONFUR.id} /> tracking module.</>,
    contributors: [Yajinni],
  },
];
