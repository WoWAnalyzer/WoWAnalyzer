import SPELLS from 'common/SPELLS';
import CoreHaste, { DEFAULT_HASTE_BUFFS } from 'parser/shared/modules/Haste';

class Haste extends CoreHaste {
  hasteBuffs = {
    ...DEFAULT_HASTE_BUFFS,
    // Shaman specific
    [SPELLS.UNLIMITED_POWER_BUFF.id]: {
      hastePerStack: 0.02,
    },
    [SPELLS.TAILWIND_TOTEM.id]: 0.02,
  };
}

export default Haste;
