import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.DANCING_RUNE_WEAPON_BUFF,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },

    {
      spell: SPELLS.VAMPIRIC_BLOOD,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
      ],
    },

    {
      spell: SPELLS.ANTI_MAGIC_SHELL,
      summary: [
        BUILT_IN_SUMMARY_TYPES.ABSORBED,
      ],
    },

  ];
}

export default CooldownThroughputTracker;
