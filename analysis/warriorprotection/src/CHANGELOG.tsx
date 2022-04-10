import { change, date } from 'common/changelog';
import { Adoraci, Abelito75, Putro, Zeboot } from 'CONTRIBUTORS';

export default [
  change(date(2022, 3, 30), 'Added a stat to show average time between Outburst procs.', Abelito75),
  change(date(2022, 3, 30), 'Added a FourSet ratio stat.', Abelito75),
  change(date(2022, 3, 30), 'Glory Stat Added.', Abelito75),
  change(date(2022, 3, 29), 'Some prettying up of stats.', Abelito75),
  change(date(2022, 3, 18), 'Corrected thresholds for BlockCheck', Abelito75),
  change(date(2022, 3, 17), 'File Clean up and abilities updated. Bumping to 9.2 and supported', Abelito75),
  change(date(2022, 3, 16), 'Converted BlockCheck and ShieldBlock to typescript.', Abelito75),
  change(date(2022, 3, 16), 'Updated Avatar\'s statistic box.', Abelito75),
  change(date(2022, 3, 16), 'Corrected Into The Fray haste buff tracking.', Abelito75),
  change(date(2021, 4, 3), 'Verified patch changes and bumped support to 9.0.5', Adoraci),
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
