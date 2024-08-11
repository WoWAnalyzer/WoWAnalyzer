import CoreHaste from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS/classic/hunter';

class Haste extends CoreHaste {
  override hasteBuffOverrides = {
    [SPELLS.RAPID_FIRE.id]: 0.4,
  };
}

export default Haste;
