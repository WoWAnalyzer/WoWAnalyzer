import { Reglitch, Gao, Oratio } from 'MAINTAINERS';
import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.DISCIPLINE_PRIEST,
  maintainers: [Reglitch, Gao, Oratio],
  patchCompatibility: '7.3.5',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  path: __dirname, // used for generating a GitHub link directly to your spec
};
