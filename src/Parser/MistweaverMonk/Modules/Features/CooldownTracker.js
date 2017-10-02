import SPELLS from 'common/SPELLS';

import CoreCooldownTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
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
    ...CooldownTracker.ignoredSpells,
    SPELLS.CHI_BURST_HEAL.id,
    SPELLS.REFRESHING_JADE_WIND_HEAL.id,
    SPELLS.SPIRIT_TETHER.id,
    SPELLS.TRANSCENDENCE.id,
    SPELLS.SOOTHING_MIST_CAST.id,
  ];
}

export default CooldownTracker;
