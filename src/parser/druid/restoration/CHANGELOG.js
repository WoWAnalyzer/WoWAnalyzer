import { Abelito75, Zeboot, LeoZhekov, Putro } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 19), 'Fixed an issue with innervate.', Abelito75),
  change(date(2020, 12, 19), 'Updated Innervate to factor in self casts are bad and correct mana spent value.', Abelito75),
  change(date(2020, 12, 15), 'Bumped level of support to 9.0.2', Putro),
  change(date(2020, 12, 13), 'Added Vision of Unending Growth', Abelito75),
  change(date(2020, 11, 19), 'Fixed Tree of Life not tracking healing', Abelito75),
  change(date(2020, 11, 19), 'Replaced the deprecated StatisticBoxes with the new Statistics', LeoZhekov),
  change(date(2020, 10, 25), 'Updated spell book and to use common libraries', Abelito75),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
  change(date(2020, 9, 26), 'Added Flash of Clarity conduit.', Abelito75),
];
