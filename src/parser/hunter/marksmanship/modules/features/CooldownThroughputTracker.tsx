import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.TRUESHOT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  static ignoredSpells = [
    ...CoreCooldownThroughputTracker.ignoredSpells,
    SPELLS.BINDING_SHOT_TETHER.id,
    SPELLS.BINDING_SHOT_ROOT.id,
  ];
}

export default CooldownThroughputTracker;
