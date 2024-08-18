import TALENTS from 'common/TALENTS/mage';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';
import GameBranch from 'game/GameBranch';
import SPELLS from 'common/SPELLS';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: TALENTS.ARCANE_SURGE_TALENT.id,
      startBufferMS: 4000,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      branch: GameBranch.Retail,
    },
    {
      spell: SPELLS.TOUCH_OF_THE_MAGI_DEBUFF.id,
      startBufferMS: 4000,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      branch: GameBranch.Retail,
    },
  ];

  static castCooldowns = [...CoreCooldownThroughputTracker.castCooldowns];
}

export default CooldownThroughputTracker;
