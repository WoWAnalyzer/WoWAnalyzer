import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';


class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.SERENITY_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: SPELLS.STORM_EARTH_AND_FIRE_CAST,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.INVOKE_XUEN_THE_WHITE_TIGER,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];
}

export default CooldownThroughputTracker;
