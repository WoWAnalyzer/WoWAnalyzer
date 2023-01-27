import TALENTS from 'common/TALENTS/rogue';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: TALENTS.DEATHMARK_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
    {
      spell: TALENTS.INDISCRIMINATE_CARNAGE_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
  ];
}

export default CooldownThroughputTracker;
