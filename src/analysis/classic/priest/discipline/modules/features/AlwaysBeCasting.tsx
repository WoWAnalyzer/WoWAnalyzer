import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import SPELLS from 'common/SPELLS/classic/priest';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD: number[] = [
    // List of healing spells on GCD
    SPELLS.BINDING_HEAL.id,
    SPELLS.DESPERATE_PRAYER.id,
    SPELLS.DIVINE_HYMN.id,
    SPELLS.FLASH_HEAL.id,
    SPELLS.GREATER_HEAL.id,
    SPELLS.HEAL.id,
    SPELLS.HOLY_NOVA.id,
    SPELLS.HYMN_OF_HOPE.id,
    SPELLS.PENANCE_HEALING.id,
    SPELLS.POWER_WORD_SHIELD.id,
    SPELLS.PRAYER_OF_HEALING.id,
    SPELLS.PRAYER_OF_MENDING.id,
    SPELLS.RENEW.id,
  ];

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.35,
        major: 1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default AlwaysBeCasting;
