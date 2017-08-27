import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import TALENT_DESCRIPTIONS from './TALENT_DESCRIPTIONS';
import CHANGELOG from './CHANGELOG';

export default {
  spec: SPECS.AFFLICTION_WARLOCK,
  maintainer: '@Chizu',
  changelog: CHANGELOG,
  parser: CombatLogParser,
  talentDescriptions: TALENT_DESCRIPTIONS,
};
