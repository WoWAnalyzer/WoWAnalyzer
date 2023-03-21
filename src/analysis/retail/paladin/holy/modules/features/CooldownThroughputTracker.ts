import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { RETAIL_EXPANSION } from 'game/Expansion';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.AVENGING_WRATH.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: TALENTS.AVENGING_CRUSADER_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: TALENTS.HOLY_AVENGER_TALENT.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
    {
      spell: SPELLS.AURA_MASTERY.id,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
      expansion: RETAIL_EXPANSION,
    },
  ];
}

export default CooldownThroughputTracker;
