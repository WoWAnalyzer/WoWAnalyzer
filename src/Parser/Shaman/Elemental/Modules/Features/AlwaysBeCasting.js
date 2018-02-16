import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Note: I need to add a few more instant cast procs with different ids
    // Elemental:
    SPELLS.ICEFURY_TALENT.id,
    SPELLS.FROST_SHOCK.id,
    SPELLS.FLAME_SHOCK.id,
    SPELLS.ELEMENTAL_BLAST_TALENT.id,
    SPELLS.LAVA_BURST.id,
    SPELLS.EARTH_SHOCK.id,

    SPELLS.LIGHTNING_BOLT.id,
    SPELLS.CHAIN_LIGHTNING.id,
    SPELLS.EARTHQUAKE.id,
    SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id,

    SPELLS.STORMKEEPER.id,
    SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id,
    SPELLS.FIRE_ELEMENTAL.id,
  ];
}

export default AlwaysBeCasting;
