import { Kettlepaw, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 21), 'Ironfur GCD and cooldown values', g3neral-wow),
  change(date(2020, 12, 18), 'Fixed compiler errors affecting FrenziedRegen and AntiFillerSpam', Kettlepaw),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
