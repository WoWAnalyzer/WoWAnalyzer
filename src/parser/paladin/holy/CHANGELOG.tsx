import React from 'react';

import { Abelito75, Putro, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [  
  change(date(2021, 1, 16), 'Due to the paywalling of the timeline feature, and fundamental differences of opinion - I will no longer be updating this module beyond todays date. All the modules should be accurate for Castle Nathria, but will not be accurate going forward.', Abelito75),
  change(date(2021, 1, 9), <>Removed Avenging Wrath, Avenging Crusader, and Holy Avenger from the gcd.</>, Abelito75),
  change(date(2021, 1, 7), <>Update direct beacon healing to include Holy Shock.</>, Abelito75),
  change(date(2021, 1, 5), <>Update direct beacon healing to include WoG.</>, Abelito75),
  change(date(2020, 12, 21), <>Fixed a bug where glimmer wasn't being tracked to feed into beacon.</>, Abelito75),
  change(date(2020, 12, 21), <>Rewrote the checklist to not be 3 miles long.</>, Abelito75),
  change(date(2020, 12, 21), <>Fixed stat weights for logs with first events being absorb healing.</>, Abelito75),
  change(date(2020, 12, 21), <>Removed glimmer build as its default now.</>, Abelito75),
  change(date(2020, 12, 21), <>Small tweek to stat weights.</>, Abelito75),
  change(date(2020, 12, 17), <>Updated spell cooldowns!</>, Abelito75),
  change(date(2020, 12, 15), 'Bumped level of support to 9.0.2', Putro),
  change(date(2020, 12, 12), <>Add Shock Barrier!</>, Abelito75),
  change(date(2020, 12, 10), <>Fixed a bug that made devo aura inaccurate.</>, Abelito75),
  change(date(2020, 12, 10), <>Fixed bug where Light of the Martyr's ineffiecent tooltip would crash the page.</>, Abelito75),
  change(date(2020, 12, 9), <>Re-enabled stat weights :).</>, Abelito75),
  change(date(2020, 10, 18), <>Updating wording and translation tags.</>, Abelito75),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 10, 15), <>Removed Light Of Dawn from Crusaders Might statistic box and fixed beacon uptime for glimmer players. </>, Abelito75),
  change(date(2020, 10, 14), <>Added nice graphic for DP to show how lucky or unlucky you were. </>, Abelito75),
  change(date(2020, 10, 13), <>Updated stat weight scaling. </>, Abelito75),
  change(date(2020, 8, 27), <>Updated core Holy Paladin for prepatch. </>, Abelito75),
];
