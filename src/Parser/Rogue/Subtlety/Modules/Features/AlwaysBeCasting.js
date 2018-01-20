import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

    //static BASE_GCD = 1000;
    
    static ABILITIES_ON_GCD = [
        SPELLS.BACKSTAB.id,
        SPELLS.SHADOWSTRIKE.id,
        SPELLS.SHURIKEN_STORM.id,
        SPELLS.SHURIKEN_TOSS.id,
        SPELLS.GOREMAWS_BITE.id,

        SPELLS.DEATH_FROM_ABOVE_TALENT.id,

        SPELLS.EVISCERATE.id,
        SPELLS.NIGHTBLADE.id,
        SPELLS.KIDNEY_SHOT.id,

        SPELLS.CRIMSON_VAIL.id,
        SPELLS.FEINT.id,
    ]

    STATIC_GCD_ABILITIES = {
        [SPELLS.BACKSTAB.id]: [1],
        [SPELLS.SHADOWSTRIKE.id]: [1],
        [SPELLS.SHURIKEN_STORM.id]: [1],
        [SPELLS.SHURIKEN_TOSS.id]: [1],
        [SPELLS.GOREMAWS_BITE.id]: [1],

        [SPELLS.DEATH_FROM_ABOVE_TALENT.id]: [1.75],

        [SPELLS.EVISCERATE.id]: [1],
        [SPELLS.NIGHTBLADE.id]: [1],
        [SPELLS.KIDNEY_SHOT.id]: [1],

        [SPELLS.CRIMSON_VAIL.id]: [1],
        [SPELLS.FEINT.id]: [1],
    }
}

export default AlwaysBeCasting;
