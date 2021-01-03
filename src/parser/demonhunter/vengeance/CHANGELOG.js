import { Zeboot, LeoZhekov, TurianSniper, Geeii } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 28), 'Updated Demonic Spikes, implemented Infernal Strikes (but disabling due to blizzard bug)', Geeii),
  change(date(2020, 12, 27), 'Updated to use Fury resource, instead of outdated Pain. Updated Soul Cleave reporting, updated ability tracking for Sigil of Flame for some cases', Geeii),
  change(date(2020, 12, 27), 'Initial SL update for talent changes and covenant abilities', TurianSniper),
  change(date(2020, 10, 30), 'Replaced the deprecated StatisticBox with the new Statistic', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
