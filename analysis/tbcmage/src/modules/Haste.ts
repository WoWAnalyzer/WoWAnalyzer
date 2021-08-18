import CoreHaste from 'parser/shared/modules/Haste';

import * as SPELLS from '../SPELLS';

class Haste extends CoreHaste {
  static HASTE_BUFFS = {
    [SPELLS.ICY_VEINS]: 0.2,
  };
}

export default Haste;
