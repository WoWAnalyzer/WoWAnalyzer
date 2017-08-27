import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import TALENT_DESCRIPTIONS from './TALENT_DESCRIPTIONS';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.HOLY_PRIEST,
  maintainer: '@enragednuke',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  talentDescriptions: TALENT_DESCRIPTIONS,
};
