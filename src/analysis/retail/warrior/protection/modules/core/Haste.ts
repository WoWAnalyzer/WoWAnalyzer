import SPELLS from 'common/SPELLS';
import CoreHaste, { DEFAULT_HASTE_BUFFS } from 'parser/shared/modules/Haste';

class Haste extends CoreHaste {
  hasteBuffs = {
    ...DEFAULT_HASTE_BUFFS,
    // Ignorrior specific
    [SPELLS.INTO_THE_FRAY_BUFF.id]: {
      // from Into the Fray (2% per stack for each enemy nearby)
      hastePerStack: 0.02,
    },
  };
}

export default Haste;
