import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
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

  static ignoredSpells = [
    ...CooldownThroughputTracker.ignoredSpells,
    242556, //Filtering procs from the Umbral Glaive Storm trinket
    242557, //Filtering procs from the Umbral Glaive Storm trinket
    242553, //Filtering procs from the Umbral Glaive Storm trinket
  ];

}

export default CooldownThroughputTracker;
