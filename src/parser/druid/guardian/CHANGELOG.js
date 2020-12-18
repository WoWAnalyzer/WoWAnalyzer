import { Kettlepaw, Zeboot } from 'CONTRIBUTORS';
import { change, date } from 'common/changelog';

export default [
  change(date(2020, 12, 18), 'Fixed compiler errors affecing FrenziedRegen and AntiFillerSpam', Kettlepaw),
  change(date(2020, 10, 18), 'Converted legacy listeners to new event filters', Zeboot),
];
