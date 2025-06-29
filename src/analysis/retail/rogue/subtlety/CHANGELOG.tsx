import { change, date } from 'common/changelog';
import { Anty, Chizu, ToppleTheNun, SamuelMaverick, Dboisvert } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/rogue/shared/CHANGELOG';

export default [
  change(date(2025, 3, 10), 'Added support for sublety rogue 11.1.0 with SamuelMaverick', Dboisvert),
  change(date(2025, 3, 12), 'Added new features, such as the Guide UI for Subtlety Rogue, and performed some code refactoring.', SamuelMaverick),
  change(date(2025, 3, 9), 'Update subtlety rogue for 11.1', SamuelMaverick),
  change(date(2023, 7, 8), 'Update SpellLink usage.', ToppleTheNun),
  change(date(2022, 12, 16), 'Fix Shuriken Storm throwing errors.', ToppleTheNun),
  change(date(2022, 12, 15), 'Fix crashing due to incorrect reference to Shadowstep.', ToppleTheNun),
  change(date(2022, 11, 5), <>Enabling Spec for Dragonflight.</>, Anty),
  change(date(2022, 10, 31), 'Update to reflect that Subtlety Rogue has been looked at for Dragonflight.', ToppleTheNun),
  change(date(2022, 10, 15), 'Initial support for Dragonflight - cleanup of old effects', Chizu),
  ...SHARED_CHANGELOG
];