import { Zeboot, LeoZhekov, Sharrq } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 30), 'Updated to Typescript and added Integration Tests', Sharrq),
  change(date(2020, 11, 2), 'Replaced the deprecated StatisticBoxes with the new Statistic', LeoZhekov),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
