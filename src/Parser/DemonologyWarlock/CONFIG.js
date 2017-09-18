import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.DEMONOLOGY_WARLOCK,
  maintainer: '@Chizu', // and @WOPR, but it doesn't fit on one line
  changelog: CHANGELOG,
  parser: CombatLogParser,
};
