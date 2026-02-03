import { change, date } from 'common/changelog';
import { Topple, Texleretour } from 'CONTRIBUTORS';
import SHARED_CHANGELOG from 'analysis/retail/demonhunter/shared/CHANGELOG';

// prettier-ignore
export default [
  change(date(2026, 1, 30), 'Add more complete foundation', Texleretour),
  change(date(2025, 10, 24), 'Add basic support for the spec.', Topple),
  ...SHARED_CHANGELOG,
];
