import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import TALENT_DESCRIPTIONS from './TALENT_DESCRIPTIONS';

export default {
  spec: SPECS.GUARDIAN_DRUID,
  maintainer: '@WOPR',
  parser: CombatLogParser,
  talentDescriptions: TALENT_DESCRIPTIONS,
};
