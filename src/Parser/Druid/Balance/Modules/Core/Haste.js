import SPELLS from 'common/SPELLS';

import CoreHaste from 'Parser/Core/Modules/Haste';

class Haste extends CoreHaste {
  static HASTE_BUFFS = {
    ...CoreHaste.HASTE_BUFFS,
    // Moonkin specific
    [SPELLS.ASTRAL_ACCELERATION.id]: { // From T20 4p
      hastePerStack: 0.02,
    },
    [SPELLS.STARLORD.id]: {
      hastePerStack: 0.03,
    },
    [SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id]: 0.15,
    [SPELLS.CELESTIAL_ALIGNMENT.id]: 0.15,
  };
}

export default Haste;
