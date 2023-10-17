import CoreHaste from 'parser/shared/modules/Haste';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import SPELLS from 'common/SPELLS/classic/priest';

class Haste extends CoreHaste {
  hasteBuffs = {
    ...super.hasteBuffs,
    ...BLOODLUST_BUFFS,
    [SPELLS.BORROWED_TIME.id]: 0.25,
  };
}

export default Haste;
