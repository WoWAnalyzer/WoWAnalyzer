import React from 'react';

import { Adoraci } from 'CONTRIBUTORS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 10, 15), <>Fix <SpellLink id={SPELLS.WARPAINT_TALENT.id} /> not calculating properly.</>, Adoraci),
  change(date(2020, 10, 12), <>Updated specialization to TypeScript</>, Adoraci),
];
