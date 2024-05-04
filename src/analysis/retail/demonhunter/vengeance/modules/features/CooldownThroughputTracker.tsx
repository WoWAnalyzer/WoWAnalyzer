import SPELLS from 'common/SPELLS/demonhunter';
import GameBranch from 'game/GameBranch';
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
      branch: GameBranch.Retail,
    },
  ];
}

export default CooldownThroughputTracker;
