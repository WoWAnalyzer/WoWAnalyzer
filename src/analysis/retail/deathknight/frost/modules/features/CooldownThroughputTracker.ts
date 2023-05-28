import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import { RETAIL_EXPANSION } from 'game/Expansion';

import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: talents.BREATH_OF_SINDRAGOSA_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: talents.PILLAR_OF_FROST_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: talents.OBLITERATION_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
      expansion: RETAIL_EXPANSION,
    },
  ];

  static ignoredSpells = [
    ...CoreCooldownThroughputTracker.ignoredSpells,
    SPELLS.REMORSELESS_WINTER_DAMAGE.id,
    SPELLS.REMORSELESS_WINTER_ENV_CAST.id,
  ];
}

export default CooldownThroughputTracker;
