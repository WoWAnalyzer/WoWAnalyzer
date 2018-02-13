import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

    static BASE_GCD = 1000;
    static MINIMUM_GCD = 1000;
    
    static ABILITIES_ON_GCD = [
        SPELLS.BACKSTAB.id,
        SPELLS.GLOOMBLADE_TALENT.id,
        SPELLS.SHADOWSTRIKE.id,
        SPELLS.SHURIKEN_STORM.id,
        SPELLS.SHURIKEN_TOSS.id,
        SPELLS.GOREMAWS_BITE.id,

        SPELLS.DEATH_FROM_ABOVE_TALENT.id,

        SPELLS.EVISCERATE.id,
        SPELLS.NIGHTBLADE.id,
        SPELLS.KIDNEY_SHOT.id,

        SPELLS.CRIMSON_VIAL.id,
        SPELLS.FEINT.id,
    ]

    static STATIC_GCD_ABILITIES = {
        [SPELLS.DEATH_FROM_ABOVE_TALENT.id]: 2000,
    }

    
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.25,
        average: 0.30,
        major: 0.35,
      },
      style: 'percentage',
    };
  }
}

export default AlwaysBeCasting;
