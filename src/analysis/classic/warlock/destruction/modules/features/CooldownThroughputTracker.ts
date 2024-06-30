import SPELLS from 'common/SPELLS/classic';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: SPELLS.DEMON_SOUL.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      duration: 20,
    },
  ];
}

export default CooldownThroughputTracker;
