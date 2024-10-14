import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import GameBranch from 'game/GameBranch';

import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: talents.BREATH_OF_SINDRAGOSA_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      branch: GameBranch.Retail,
    },
    {
      spell: talents.PILLAR_OF_FROST_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      branch: GameBranch.Retail,
    },
  ];

  static ignoredSpells = [
    ...CoreCooldownThroughputTracker.ignoredSpells,
    SPELLS.REMORSELESS_WINTER_DAMAGE.id,
    SPELLS.REMORSELESS_WINTER_ENV_CAST.id,
  ];
}

export default CooldownThroughputTracker;
