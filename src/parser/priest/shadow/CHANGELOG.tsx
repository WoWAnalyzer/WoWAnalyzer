import React from 'react';

import { Adoraci, Sharrq, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 10, 23), <>Update example log to more recent one.</>, [Adoraci]),
  change(date(2020, 10, 18), <>Converted legacy listeners to new event filters</>, Zeboot),
  change(date(2020, 10, 17), <>Updated for Shadowlands Pre-Patch.</>, [Adoraci]),
  change(date(2020, 9, 21), <>Removed Azerite Traits and Added Event Listeners, Centralized Constants, and Integration Tests. </>, [Sharrq]),
];
