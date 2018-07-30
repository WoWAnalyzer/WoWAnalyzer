import SPELLS from 'common/SPELLS';
import CoreAlwaysBeCastingHealing from 'Parser/Core/Modules/AlwaysBeCastingHealing';

class AlwaysBeCasting extends CoreAlwaysBeCastingHealing {
  static HEALING_ABILITIES_ON_GCD = [
    SPELLS.REJUVENATION.id,
    SPELLS.REGROWTH.id,
    SPELLS.WILD_GROWTH.id,
    SPELLS.TRANQUILITY_CAST.id,
    SPELLS.CENARION_WARD_TALENT.id,
    SPELLS.LIFEBLOOM_HOT_HEAL.id,
    SPELLS.SWIFTMEND.id,
    SPELLS.FLOURISH_TALENT.id,
    SPELLS.EFFLORESCENCE_CAST.id,
    SPELLS.NATURES_CURE.id,
  ];

  get nonHealingTimeSuggestionThresholds() {
    return {
      actual: this.nonHealingTimePercentage,
      isGreaterThan: {
        minor: 0.3,
        average: 0.4,
        major: 0.8,
      },
      style: 'percentage',
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
      style: 'percentage',
    };
  }
}

export default AlwaysBeCasting;
