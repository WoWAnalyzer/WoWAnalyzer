import { change, date } from 'common/changelog';
import { Tyndi, Vireve, Vollmer } from 'CONTRIBUTORS';

export default [
  change(date(2023, 6, 3), 'Initial update for 10.1', Vollmer),
  change(date(2022, 12, 31), 'Move rotation module further down and mark experimental', Vireve),
  change(date(2022, 12, 25), 'Initialize a primitive guide for Devastation!', Vireve),
  change(date(2022, 10, 25), 'Updated abilities list to include all available abilities.', Tyndi),
  change(date(2022, 9, 30), <>Added first module to Devastation</>, Tyndi),
];
