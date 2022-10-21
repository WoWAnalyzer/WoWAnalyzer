import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';

import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: talents.BREATH_OF_SINDRAGOSA_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
    {
      spell: talents.PILLAR_OF_FROST_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
    {
      spell: talents.OBLITERATION_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
  ];

  static ignoredSpells = [
    ...CoreCooldownThroughputTracker.ignoredSpells,
    SPELLS.REMORSELESS_WINTER_TALENT_DAMAGE.id,
    SPELLS.REMORSELESS_WINTER_TALENT_ENV_CAST.id,
  ];
}

export default CooldownThroughputTracker;
