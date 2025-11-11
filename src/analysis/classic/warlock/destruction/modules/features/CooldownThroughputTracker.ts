import spells from '../../spell-list_Warlock_Destruction.classic';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: spells.DARK_SOUL.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      duration: 20,
    },
  ];
}

export default CooldownThroughputTracker;
