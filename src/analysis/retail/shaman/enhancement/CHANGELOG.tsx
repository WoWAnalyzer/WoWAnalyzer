import { change, date } from 'common/changelog';
import { Taum, Vetyst, xunni } from 'CONTRIBUTORS';

export default [
  change(date(2022, 1, 1), <>Add Frost Shock cooldown so it displays on timeline.</>, xunni),
  change(date(2022, 12, 31), <>Added Lava Lash per Hot Hand proc stats, fixed misreporting possible casts of Lava Lash.</>, Taum),
  change(date(2022, 12, 28), <>Remove outdated Ice Strike and Crashing Storms modules to avoid confusion.</>, xunni),
  change(date(2022, 11, 1), <>Cleanup changelog for Pre-patch.</>, Vetyst),
];
