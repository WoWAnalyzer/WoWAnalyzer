import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';
import TALENTS from 'common/TALENTS/warrior';
import GameBranch from 'game/GameBranch';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: TALENTS.AVATAR_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      branch: GameBranch.Retail,
    },
  ];
}

export default CooldownThroughputTracker;
