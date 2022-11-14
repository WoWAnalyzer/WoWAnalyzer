import { change, date } from 'common/changelog';
import { Klex, jazminite } from 'CONTRIBUTORS';

export default [
  change(date(2022, 11, 1), 'Update and re-org Classic Mage spells.', jazminite),
  change(date(2021, 8, 14), 'Initial setup, only supports arcane CDs/consumables.', Klex),
];
