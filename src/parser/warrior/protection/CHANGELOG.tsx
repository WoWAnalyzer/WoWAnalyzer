import React from 'react';

import { Abelito75, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 17), 'Removed all BFAisms.', Abelito75),
  change(date(2020, 10, 18), 'Updated Talents', Abelito75),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 14), <>Fixed checklist and updated spellbook to prevent crashes.</>, Abelito75),
];
