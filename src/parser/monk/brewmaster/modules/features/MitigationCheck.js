import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';
import SPELLS from 'common/SPELLS';


class MitigationCheck extends CoreMitigationCheck {
  constructor(...args){
    super(...args);
    this.buffCheck = [SPELLS.IRONSKIN_BREW_BUFF.id,
                      SPELLS.FORTIFYING_BREW_BRM_BUFF.id,
                      SPELLS.ZEN_MEDITATION.id,
                      SPELLS.DAMPEN_HARM_TALENT.id];
    this.debuffCheck = [];
  }
}

export default MitigationCheck;
