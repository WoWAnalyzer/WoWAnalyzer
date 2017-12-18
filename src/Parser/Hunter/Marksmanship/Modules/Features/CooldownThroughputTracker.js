import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.TRUESHOT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.BULLSEYE_BUFF,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  static ignoredSpells = [
    ...CooldownThroughputTracker.ignoredSpells,
    SPELLS.WINDBURST_MOVEMENT_SPEED.id,
    SPELLS.CYCLONIC_BURST_TRAIT.id,
    SPELLS.CYCLONIC_BURST_IMPACT_TRAIT.id,
    SPELLS.BINDING_SHOT_STUN.id,
    SPELLS.BINDING_SHOT_TETHER.id,
    SPELLS.GOLGANNETHS_VITALITY_RAVAGING_STORM.id,
    SPELLS.GOLGANNETHS_VITALITY_THUNDEROUS_WRATH.id,
  ];
}

export default CooldownThroughputTracker;

