import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.GUARDIAN_DRUID,
  maintainer: '@faide',
  changelog: CHANGELOG,
  parser: CombatLogParser,
};
