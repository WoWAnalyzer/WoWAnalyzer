import CoreMitigationCheck from 'parser/core/modules/MitigationCheck';
import SPELLS from 'common/SPELLS';


class MitigationCheck extends CoreMitigationCheck {
  constructor(...args){
    super(...args);
    this.buffCheck = [SPELLS.IRONFUR.id,
                      SPELLS.FRENZIED_REGENERATION.id,
                      SPELLS.BARKSKIN.id,
                      SPELLS.SURVIVAL_INSTINCTS.id];
  }
}

export default MitigationCheck;
