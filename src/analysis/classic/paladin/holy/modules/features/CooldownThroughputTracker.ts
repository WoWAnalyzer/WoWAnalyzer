import SPELLS from 'common/SPELLS/classic';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: SPELLS.INNERVATE.id,
      summary: [BUILT_IN_SUMMARY_TYPES.MANA],
    },
    {
      spell: SPELLS.AVENGING_WRATH.id,
      summary: [BUILT_IN_SUMMARY_TYPES.HEALING],
    },
    {
      spell: SPELLS.DIVINE_SACRIFICE.id,
      summary: [BUILT_IN_SUMMARY_TYPES.ABSORBED, BUILT_IN_SUMMARY_TYPES.HEALING],
    },
    {
      spell: SPELLS.AURA_MASTERY.id,
      summary: [BUILT_IN_SUMMARY_TYPES.ABSORBED, BUILT_IN_SUMMARY_TYPES.HEALING],
    },
  ];
}

export default CooldownThroughputTracker;
