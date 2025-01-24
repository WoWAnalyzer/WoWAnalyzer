import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warrior';
import GameBranch from 'game/GameBranch';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.SWEEPING_STRIKES.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      branch: GameBranch.Retail,
    },
    {
      spell: TALENTS.AVATAR_SHARED_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      branch: GameBranch.Retail,
    },
  ];

  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: TALENTS.WARBREAKER_TALENT.id,
      duration: 10,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
    {
      spell: TALENTS.COLOSSUS_SMASH_TALENT.id,
      duration: 13, // blunt instruments talent
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
  ];
}

export default CooldownThroughputTracker;
