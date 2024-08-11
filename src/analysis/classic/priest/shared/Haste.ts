import CoreHaste, { DEFAULT_HASTE_BUFFS } from 'parser/shared/modules/Haste';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import SPELLS from 'common/SPELLS/classic';

class Haste extends CoreHaste {
  hasteBuffs = {
    ...DEFAULT_HASTE_BUFFS,
    ...BLOODLUST_BUFFS,
    [SPELLS.BORROWED_TIME_7.id]: 0.07,
    [SPELLS.BORROWED_TIME_14.id]: 0.14,
    [SPELLS.BERSERKING.id]: 0.2,
    // [SPELLS.SHADOWFORM.id]: 0.05,
  };
}

export default Haste;
