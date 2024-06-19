import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/demonhunter/shared/CHANGELOG';

// prettier-ignore
export default [
  change(date(2024, 6, 17), 'Begin working on support for The War Within.', ToppleTheNun),
  ...SHARED_CHANGELOG,
];
