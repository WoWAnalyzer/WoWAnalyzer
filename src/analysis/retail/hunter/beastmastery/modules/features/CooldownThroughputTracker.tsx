import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { RETAIL_EXPANSION } from 'game/Expansion';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: TALENTS.BESTIAL_WRATH_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
  ];

  static ignoredSpells = [
    ...CoreCooldownThroughputTracker.ignoredSpells,
    SPELLS.BINDING_SHOT_TETHER.id,
    SPELLS.BINDING_SHOT_ROOT.id,
  ];
}

export default CooldownThroughputTracker;
