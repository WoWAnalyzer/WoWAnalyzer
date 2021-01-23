import React from 'react';

import { Adoraci, Abelito75 } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 17), 'Added some shadowlandisms.', Abelito75),
  change(date(2020, 12, 17), 'Removed all BFAisms.', Abelito75),
  change(date(2020, 12, 14), <>Fixed rage tracker.</>, Abelito75),
  change(date(2020, 10, 15), <>Fix <SpellLink id={SPELLS.WARPAINT_TALENT.id} /> not calculating properly.</>, Adoraci),
  change(date(2020, 10, 12), <>Updated specialization to TypeScript</>, Adoraci),
];
