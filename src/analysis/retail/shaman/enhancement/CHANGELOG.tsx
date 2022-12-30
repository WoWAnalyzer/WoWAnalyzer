import { change, date } from 'common/changelog';
import { Vetyst, xunni } from 'CONTRIBUTORS';

export default [
  change(date(2022, 12, 28), <>Remove outdated Ice Strike and Crashing Storms modules to avoid confusion.</>, xunni),
  change(date(2022, 11, 1), <>Cleanup changelog for Pre-patch.</>, Vetyst),
];
