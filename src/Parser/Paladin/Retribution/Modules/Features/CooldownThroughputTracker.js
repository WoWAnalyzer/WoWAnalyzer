import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.AVENGING_WRATH,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.CRUSADE_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];
  
  static ignoredSpells = [
    ...CooldownThroughputTracker.ignoredSpells,
    SPELLS.DIVINE_HAMMER_HIT.id,
    SPELLS.UMBRAL_GLAIVE_STORM_TICK.id,
  ];
}

export default CooldownThroughputTracker;