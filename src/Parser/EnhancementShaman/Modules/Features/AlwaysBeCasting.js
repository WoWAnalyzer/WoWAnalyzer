import SPELLS from 'common/SPELLS';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Note: I need to add a few more instant cast procs with different ids
    // Enhancement:
    SPELLS.ROCKBITER.id,
    SPELLS.FROSTBRAND.id,
    SPELLS.FLAMETONGUE.id,
    SPELLS.CRASH_LIGHTNING.id,
    SPELLS.FERAL_SPIRIT.id,

    SPELLS.LIGHTNING_BOLT.id,
    SPELLS.STORMSTRIKE.id,
    SPELLS.LAVA_LASH.id,
    SPELLS.FURY_OF_AIR.id,

    SPELLS.EARTHEN_SPIKE.id,
    SPELLS.DOOM_WINDS.id,
    SPELLS.SUNDERING.id,
  ];
}

export default AlwaysBeCasting;
