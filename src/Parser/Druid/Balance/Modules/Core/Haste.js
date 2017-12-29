import SPELLS from 'common/SPELLS';

import CoreHaste from 'Parser/Core/Modules/Haste';

class Haste extends CoreHaste {
  static HASTE_BUFFS = {
    ...CoreHaste.HASTE_BUFFS,
    // Moonkin specific
    [SPELLS.ASTRAL_ACCELERATION.id]: { // From T20 4p
      hastePerStack: 0.02,
    },
    [SPELLS.STAR_POWER.id]: { // From casts in Incarnation / CA
      hastePerStack: combatant => combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id) ? 0.01 : 0.03,
    },
  };
}

export default Haste;
