import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

    static BASE_GCD = 1000;
    static MINIMUM_GCD = 1000;
    
    static ABILITIES_ON_GCD = [
        SPELLS.GARROTE.id,
        SPELLS.MUTILATE.id,
        SPELLS.FAN_OF_KNIVES.id,
        SPELLS.POISONED_KNIFE.id,
        SPELLS.KINGSBANE.id,
        SPELLS.TOXIC_BLADE_TALENT.id,

        SPELLS.DEATH_FROM_ABOVE_TALENT.id,

        SPELLS.ENVENOM.id,
        SPELLS.RUPTURE.id,
        SPELLS.KIDNEY_SHOT.id,

        SPELLS.CRIMSON_VAIL.id,
        SPELLS.FEINT.id,
    ]

    static STATIC_GCD_ABILITIES = {
        [SPELLS.DEATH_FROM_ABOVE_TALENT.id]: 2000,
    }

    
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.4,
        average: 0.45,
        major: 0.5,
      },
      style: 'percentage',
    };
  }
}

export default AlwaysBeCasting;
