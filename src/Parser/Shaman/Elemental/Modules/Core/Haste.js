import SPELLS from 'common/SPELLS';

import CoreHaste from 'Parser/Core/Modules/Haste';

class Haste extends CoreHaste {
  static HASTE_BUFFS = {
    ...CoreHaste.HASTE_BUFFS,
    // Shaman specific
    [SPELLS.UNLIMITED_POWER_BUFF.id]: {
      hastePerStack: 0.02,
    },
    [SPELLS.TAILWIND_TOTEM.id]: 0.02,
  };
}

export default Haste;
