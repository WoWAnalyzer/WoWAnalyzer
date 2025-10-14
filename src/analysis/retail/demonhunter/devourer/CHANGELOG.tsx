import { change, date } from 'common/changelog';
import { ToppleTheNun } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/demonhunter/shared/CHANGELOG';

// prettier-ignore
export default [
  change(date(2025, 10, 24), 'Add basic support for the spec.', ToppleTheNun),
  ...SHARED_CHANGELOG,
];
