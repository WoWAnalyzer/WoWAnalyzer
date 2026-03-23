import { change, date } from 'common/changelog';
import { Earosselot } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/rogue/shared/CHANGELOG';

export default [
  change(date(2026, 3, 20), <>Enable Sublety for midnight</>, Earosselot),
  ...SHARED_CHANGELOG,
];