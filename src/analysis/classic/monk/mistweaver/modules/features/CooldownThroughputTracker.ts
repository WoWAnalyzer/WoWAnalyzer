import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';
import spells from '../../spell-list_Monk_Mistweaver.classic';
import GameBranch from 'game/GameBranch';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    // Add Cooldown Spells specific to Spec
  ];

  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: spells.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.HEALING, BUILT_IN_SUMMARY_TYPES.DAMAGE],
      petID: 63508,
      branch: GameBranch.Classic,
    },
  ];
}

export default CooldownThroughputTracker;
