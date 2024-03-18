import CoreHaste, { DEFAULT_HASTE_BUFFS } from 'parser/shared/modules/Haste';

class Haste extends CoreHaste {
  hasteBuffs = {
    ...DEFAULT_HASTE_BUFFS,
  };
}

export default Haste;
