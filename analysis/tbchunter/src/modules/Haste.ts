import CoreHaste from 'parser/shared/modules/Haste';

import * as SPELLS from '../SPELLS';

class Haste extends CoreHaste {
  static HASTE_BUFFS = {
    [SPELLS.QUICK_SHOTS]: 0.15,
    [SPELLS.RAPID_FIRE]: 0.4,
  };
}

export default Haste;
