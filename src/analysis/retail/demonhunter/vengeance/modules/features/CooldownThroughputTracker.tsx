import SPELLS from 'common/SPELLS/demonhunter';
import { RETAIL_EXPANSION } from 'game/Expansion';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.METAMORPHOSIS_TANK.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
        BUILT_IN_SUMMARY_TYPES.ABSORBED,
        BUILT_IN_SUMMARY_TYPES.HEALING,
      ],
      expansion: RETAIL_EXPANSION,
    },
  ];
}

export default CooldownThroughputTracker;
