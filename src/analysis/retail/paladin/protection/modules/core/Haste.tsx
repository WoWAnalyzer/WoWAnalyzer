import CoreHaste from 'parser/shared/modules/Haste';
import TALENTS from 'common/TALENTS/paladin';

class Haste extends CoreHaste {
  static HASTE_BUFFS = {
    ...CoreHaste.HASTE_BUFFS,
    // Prot paladin specific
    [TALENTS.SERAPHIM_TALENT.id]: 0.08,
  };
}

export default Haste;
