import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, {
  BUILT_IN_SUMMARY_TYPES,
} from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.DARK_SOUL_INSTABILITY_TALENT.id,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
  ];

  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: SPELLS.HAVOC.id,
      duration: 10,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
    {
      spell: SPELLS.SUMMON_INFERNAL.id,
      duration: 30,
      summary: [BUILT_IN_SUMMARY_TYPES.DAMAGE],
    },
  ];
}

export default CooldownThroughputTracker;
