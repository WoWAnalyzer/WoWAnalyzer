import React from 'react';

import { Abelito75, Putro, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2021, 1, 16), 'Due to the paywalling of the timeline feature, and fundamental differences of opinion - I will no longer be updating this module beyond todays date. All the modules should be accurate for Castle Nathria, but will not be accurate going forward.', Abelito75),
  change(date(2021, 1, 10), 'Updated to 9.0.2.', Abelito75),
  change(date(2021, 1, 10), 'Added Thunderlord statistic.', Abelito75),
  change(date(2021, 1, 10), 'Added The Wall statistic.', Abelito75),
  change(date(2021, 1, 8), 'Fixed block check because zeboot broke it.', Abelito75),
  change(date(2020, 12, 17), 'Fixed undefined spell error.', Abelito75),
  change(date(2020, 12, 17), 'Added some shadowlandisms.', Abelito75),
  change(date(2020, 12, 17), 'Removed all BFAisms.', Abelito75),
  change(date(2020, 12, 15), 'Bumped level of support to 9.0.2', Putro),
  change(date(2020, 10, 18), 'Updated Talents', Abelito75),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 14), <>Fixed checklist and updated spellbook to prevent crashes.</>, Abelito75),
];
