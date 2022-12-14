import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { RETAIL_EXPANSION } from 'game/Expansion';

import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.VOIDFORM_BUFF.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: TALENTS.DARK_ASCENSION_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
  ];
}

export default CooldownThroughputTracker;
