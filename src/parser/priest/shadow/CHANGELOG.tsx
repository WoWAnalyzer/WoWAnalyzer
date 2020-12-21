import React from 'react';

import { Abelito75, Adoraci, Sharrq, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 21), <>Corrected spell cooldowns and ID changes from launch.</>, [Adoraci]),
  change(date(2020, 12, 10), <>Corrected Power Infusion spell ID.</>, [Abelito75]),
  change(date(2020, 10, 23), <>Update example log to more recent one.</>, [Adoraci]),
  change(date(2020, 10, 18), <>Converted legacy listeners to new event filters</>, Zeboot),
  change(date(2020, 10, 17), <>Updated for Shadowlands Pre-Patch.</>, [Adoraci]),
  change(date(2020, 9, 21), <>Removed Azerite Traits and Added Event Listeners, Centralized Constants, and Integration Tests. </>, [Sharrq]),
];
