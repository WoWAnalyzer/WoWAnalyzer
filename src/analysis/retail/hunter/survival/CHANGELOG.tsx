import { change, date } from 'common/changelog';
import { Putro, Arlie, ToppleTheNun } from 'CONTRIBUTORS';

export default [
  change(date(2023, 7, 3), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2022, 12, 16), 'Re-enable log parser.', ToppleTheNun),
  change(date(2022, 11, 11), 'Initial transition of Survival to Dragonflight', [Arlie, Putro]),
];
