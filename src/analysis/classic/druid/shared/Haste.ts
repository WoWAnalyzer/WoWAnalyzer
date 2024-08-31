import CoreHaste from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS/classic/druid';

class Haste extends CoreHaste {
  override hasteBuffOverrides = {
    [SPELLS.NATURES_GRACE_BUFF.id]: 0.15, // with rank 3 talent
  };
}

export default Haste;
