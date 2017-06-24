// import SPECS from 'common/SPECS';

import CombatLogParser from './CombatLogParser';
import TALENT_DESCRIPTIONS from './TALENT_DESCRIPTIONS';

export default {
  spec: { id: 0, className: 'Unsupported', specName: 'Spec' }, // SPECS.HOLY_PALADIN,
  maintainer: '@Zerotorescue',
  parser: CombatLogParser,
  talentDescriptions: TALENT_DESCRIPTIONS,
};
