import SPELLS from 'common/SPELLS';
import CoreHaste from 'parser/shared/modules/Haste';

class Haste extends CoreHaste {
  static HASTE_BUFFS = {
    ...CoreHaste.HASTE_BUFFS,
    //Ret specific
    [SPELLS.CRUSADE_TALENT.id]: {
      hastePerStack: 0.03,
    },
    [SPELLS.INQUISITION_TALENT.id]: 0.07,
  };
}

export default Haste;
