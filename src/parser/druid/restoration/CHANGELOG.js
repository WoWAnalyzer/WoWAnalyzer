import { Abelito75, Zeboot, LeoZhekov } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 11, 19), 'Fixed Tree of Life not tracking healing', LeoZhekov),
  change(date(2020, 11, 19), 'Replaced the deprecated StatisticBoxes with the new Statistics', LeoZhekov),
  change(date(2020, 10, 25), 'Updated spell book and to use common libraries', Abelito75),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 9, 26), 'Added Flash of Clarity conduit.', Abelito75),
];
