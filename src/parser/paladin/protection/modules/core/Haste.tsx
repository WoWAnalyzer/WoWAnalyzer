import SPELLS from 'common/SPELLS';
import CoreHaste from 'parser/shared/modules/Haste';

class Haste extends CoreHaste {
  static HASTE_BUFFS = {
    ...CoreHaste.HASTE_BUFFS,
    // Prot paladin specific
    [SPELLS.SERAPHIM_TALENT.id]: 0.08,
  }
}

export default Haste;
