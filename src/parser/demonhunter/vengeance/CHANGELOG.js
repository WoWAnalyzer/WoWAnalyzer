import { Zeboot, LeoZhekov, TurianSniper, Geeii } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 27), 'Updated Soul Cleave tracking', Geeii),
  change(date(2020, 12, 27), 'Updated to use Fury resource, instead of outdated Pain', Geeii),
  change(date(2020, 12, 27), 'Initial SL update for talent changes and covenant abilities', TurianSniper),
  change(date(2020, 12, 25), 'Fix variable name for Immolation Aura', TurianSniper),
  change(date(2020, 10, 30), 'Replaced the deprecated StatisticBox with the new Statistic', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
