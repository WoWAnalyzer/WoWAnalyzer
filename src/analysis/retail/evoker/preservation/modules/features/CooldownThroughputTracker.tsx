import { TALENTS_EVOKER } from 'common/TALENTS';
import { RETAIL_EXPANSION } from 'game/Expansion';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: TALENTS_EVOKER.DREAM_FLIGHT_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: TALENTS_EVOKER.REWIND_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
  ];
  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: TALENTS_EVOKER.EMERALD_COMMUNION_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
  ];

  static ignoredSpells = [...CoreCooldownThroughputTracker.ignoredSpells];
}

export default CooldownThroughputTracker;
