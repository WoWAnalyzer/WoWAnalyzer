import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

    static BASE_GCD = 1000;
    static MINIMUM_GCD = 1000;
    
    static ABILITIES_ON_GCD = [
        SPELLS.AMBUSH.id,
        SPELLS.BLUNDERBUSS.id,
        SPELLS.PISTOL_SHOT.id,
        SPELLS.SABER_SLASH.id,
        SPELLS.CURSE_OF_THE_DREADBLADES.id,

        SPELLS.DEATH_FROM_ABOVE_TALENT.id,

        SPELLS.RUN_THROUGH.id,
        SPELLS.BETWEEN_THE_EYES.id,
        SPELLS.ROLL_THE_BONES.id,
        SPELLS.SLICE_AND_DICE_TALENT.id,

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
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: 'percentage',
    };
  }
}

export default AlwaysBeCasting;
