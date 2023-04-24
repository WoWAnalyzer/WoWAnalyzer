import { change, date } from 'common/changelog';
import { xizbow, Klamuz, emallson, ToppleTheNun } from 'CONTRIBUTORS';

export default [
  change(date(2023, 4, 24), 'Fix more crashes related to 10.0.7 talent changes.', ToppleTheNun),
  change(date(2023, 3, 26), 'Fix crashes related to 10.0.7 talent changes', emallson),
  change(date(2023, 2, 3), <>Added Paladin Retribution Partial Support for Dragonflight 10.0.5</>, Klamuz),
  change(date(2022, 4, 15), <>Added Holy Power Generated Per Minute statistic</>, xizbow),
];
