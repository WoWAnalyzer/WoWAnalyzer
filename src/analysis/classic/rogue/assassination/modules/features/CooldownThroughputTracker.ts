import SPELLS from 'common/SPELLS/classic/rogue';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    // Add Cooldown Spells specific to Spec
    {
      spell: SPELLS.BLADE_FLURRY.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
  ];
}

export default CooldownThroughputTracker;
