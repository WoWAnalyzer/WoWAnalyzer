import CoreHaste, { DEFAULT_HASTE_BUFFS } from 'parser/shared/modules/Haste';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import SPELLS from 'common/SPELLS/classic/warlock';

class Haste extends CoreHaste {
  hasteBuffs = {
    ...DEFAULT_HASTE_BUFFS,
    ...BLOODLUST_BUFFS,
    [SPELLS.ERADICATION_BUFF_6.id]: 0.06,
    [SPELLS.ERADICATION_BUFF_12.id]: 0.12,
    [SPELLS.ERADICATION_BUFF_20.id]: 0.2,
  };
}

export default Haste;
