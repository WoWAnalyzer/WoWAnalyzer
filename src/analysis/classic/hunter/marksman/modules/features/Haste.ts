import CoreHaste, { DEFAULT_HASTE_BUFFS } from 'parser/shared/modules/Haste';
import SPELLS from 'common/SPELLS/classic/hunter';

class Haste extends CoreHaste {
  hasteBuffs = {
    ...DEFAULT_HASTE_BUFFS,
    [SPELLS.RAPID_FIRE.id]: 0.4,
  };
}

export default Haste;
