import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';
import { RETAIL_EXPANSION } from 'game/Expansion';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.AVENGING_WRATH.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: SPELLS.CRUSADE_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: SPELLS.EXECUTION_SENTENCE_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
  ];
}

export default CooldownThroughputTracker;
