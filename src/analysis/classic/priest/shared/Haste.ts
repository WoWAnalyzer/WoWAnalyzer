import CoreHaste from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS/classic/priest';

class Haste extends CoreHaste {
  override hasteBuffOverrides = {
    [SPELLS.BORROWED_TIME_7.id]: 0.07,
    [SPELLS.BORROWED_TIME_14.id]: 0.14,
    [SPELLS.BORROWED_TIME_15.id]: 0.15,
  };
}

export default Haste;
