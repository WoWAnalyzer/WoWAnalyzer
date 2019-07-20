import React from 'react';

import { Yajinni} from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2018, 8, 9), <>Fixed <SpellLink id={SPELLS.IRONFUR.id} /> tracking module.</>, [Yajinni]),
];
