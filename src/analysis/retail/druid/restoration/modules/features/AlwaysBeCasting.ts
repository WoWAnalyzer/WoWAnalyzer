import SPELLS from 'common/SPELLS';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCastingHealing from 'parser/shared/modules/AlwaysBeCastingHealing';
import { TALENTS_DRUID } from 'common/TALENTS';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  HEALING_ABILITIES_ON_GCD = [
    SPELLS.REJUVENATION.id,
    SPELLS.REGROWTH.id,
    SPELLS.WILD_GROWTH.id,
    SPELLS.TRANQUILITY_CAST.id,
    TALENTS_DRUID.CENARION_WARD_RESTORATION_TALENT.id,
    SPELLS.LIFEBLOOM_HOT_HEAL.id,
    SPELLS.LIFEBLOOM_UNDERGROWTH_HOT_HEAL.id,
    SPELLS.SWIFTMEND.id,
    TALENTS_DRUID.FLOURISH_RESTORATION_TALENT.id,
    SPELLS.EFFLORESCENCE_CAST.id,
    SPELLS.NATURES_CURE.id,
    TALENTS_DRUID.NOURISH_RESTORATION_TALENT.id,
  ];

  get nonHealingTimeSuggestionThresholds() {
    return {
      actual: this.nonHealingTimePercentage,
      isGreaterThan: {
        minor: 0.3,
        average: 0.4,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.3,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default AlwaysBeCasting;
