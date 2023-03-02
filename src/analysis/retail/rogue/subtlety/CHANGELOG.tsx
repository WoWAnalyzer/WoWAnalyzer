import { change, date } from 'common/changelog';
import { Anty, Chizu, ToppleTheNun } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/rogue/shared/CHANGELOG';

export default [
  change(date(2022, 12, 16), 'Fix Shuriken Storm throwing errors.', ToppleTheNun),
  change(date(2022, 12, 15), 'Fix crashing due to incorrect reference to Shadowstep.', ToppleTheNun),
  change(date(2022, 11, 5), <>Enabling Spec for Dragonflight.</>, Anty),
  change(date(2022, 10, 31), 'Update to reflect that Subtlety Rogue has been looked at for Dragonflight.', ToppleTheNun),
  change(date(2022, 10, 15), 'Initial support for Dragonflight - cleanup of old effects', Chizu),
  ...SHARED_CHANGELOG
];
