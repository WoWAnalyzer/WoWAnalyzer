import React from 'react';

import { Yajinni, Sharrq } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 10, 13), 'Removed BFA Azerite Traits.', [Sharrq]),
  change(date(2018, 8, 9), <>Fixed <SpellLink id={SPELLS.IRONFUR.id} /> tracking module.</>, [Yajinni]),
];
