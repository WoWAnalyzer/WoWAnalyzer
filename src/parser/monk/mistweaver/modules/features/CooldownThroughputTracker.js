import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/core/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.MANA_TEA_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
  ];

  static ignoredSpells = [
    ...CooldownThroughputTracker.ignoredSpells,
    SPELLS.CHI_BURST_HEAL.id,
    SPELLS.REFRESHING_JADE_WIND_HEAL.id,
    SPELLS.SPIRIT_TETHER.id,
    SPELLS.TRANSCENDENCE.id,
    SPELLS.SOOTHING_MIST_CAST.id,
  ];
}

export default CooldownThroughputTracker;
