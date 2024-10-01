import CoreHaste from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS/classic/warlock';

class Haste extends CoreHaste {
  override hasteBuffOverrides = {
    [SPELLS.ERADICATION_BUFF_6.id]: 0.06,
    [SPELLS.ERADICATION_BUFF_12.id]: 0.12,
    [SPELLS.ERADICATION_BUFF_20.id]: 0.2,
    [SPELLS.DEMON_SOUL_FELGUARD_BUFF.id]: 0.15,
  };
}

export default Haste;
