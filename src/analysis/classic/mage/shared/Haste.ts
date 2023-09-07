import CoreHaste from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS/classic/mage';

class Haste extends CoreHaste {
  hasteBuffs = {
    ...super.hasteBuffs,
    [SPELLS.ICY_VEINS.id]: 0.2,
  };
}

export default Haste;
