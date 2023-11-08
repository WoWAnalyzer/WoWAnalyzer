import TALENTS from 'common/TALENTS/mage';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';
import { RETAIL_EXPANSION } from 'game/Expansion';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: TALENTS.ARCANE_SURGE_TALENT.id,
      startBufferMS: 4000,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: TALENTS.RADIANT_SPARK_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
  ];

  static castCooldowns = [...CoreCooldownThroughputTracker.castCooldowns];
}

export default CooldownThroughputTracker;
