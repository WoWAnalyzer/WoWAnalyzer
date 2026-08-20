import { change, date } from 'common/changelog';
import { Nooseknitter, Topping } from 'CONTRIBUTORS';

export default [
  change(
    date(2026, 8, 20),
    'Add action-priority-list and opener analysis for Frost Death Knights.',
    Topping,
  ),
  change(
    date(2026, 5, 2),
    'Updated analysis for Frostscythe, Empower Rune Weapon, and Breath of Sindragosa',
    Nooseknitter,
  ),
  change(date(2026, 4, 27), 'Updates for 12.0.5: Enabling Frost DK', Nooseknitter),
];
