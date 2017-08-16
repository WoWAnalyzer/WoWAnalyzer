import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [

    // Abilities
    SPELLS.IMMOLATION_AURA.id,
    SPELLS.IMPRISON.id,
    SPELLS.SHEAR.id,
    SPELLS.SIGIL_OF_FLAME.id,
    SPELLS.SIGIL_OF_MISERY.id,
    SPELLS.SIGIL_OF_SILENCE.id,
    SPELLS.SOUL_CARVER.id,
    SPELLS.SOUL_CLEAVE.id,
    SPELLS.THROW_GLAIVE.id,

    // Talents
    SPELLS.FELBLADE_TALENT.id,
    SPELLS.FEL_DEVASTATION_TALENT.id,
    SPELLS.FEL_ERUPTION_TALENT.id,
    SPELLS.FRACTURE_TALENT.id,
    SPELLS.SIGIL_OF_CHAINS_TALENT.id,
    SPELLS.SOUL_BARRIER_TALENT.id,
    SPELLS.SPIRIT_BOMB_TALENT.id,
  ];
}

export default AlwaysBeCasting;
