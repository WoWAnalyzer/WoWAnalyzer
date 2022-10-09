import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.ICY_VEINS.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
    {
      spell: TALENTS.RUNE_OF_POWER_TALENT.id,
      duration: 10,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
  ];

  static castCooldowns = [...CoreCooldownThroughputTracker.castCooldowns];
}

export default CooldownThroughputTracker;
