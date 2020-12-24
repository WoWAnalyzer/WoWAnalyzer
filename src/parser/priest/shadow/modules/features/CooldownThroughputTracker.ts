import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.VOIDFORM_BUFF,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.POWER_INFUSION,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.BOON_OF_THE_ASCENDED,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];
}

export default CooldownThroughputTracker;
