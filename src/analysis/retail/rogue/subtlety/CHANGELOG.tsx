import { change, date } from 'common/changelog';
import { Anty, Chizu, ToppleTheNun, SamuelMaverick, Dboisvert } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/rogue/shared/CHANGELOG';

export default [
  change(date(2026, 3, 23), <>Adding Shadow Dance Module</>, Earosselot),
  change(date(2026, 3, 20), <>Enable Sublety for midnight</>, Earosselot),
  ...SHARED_CHANGELOG,
];