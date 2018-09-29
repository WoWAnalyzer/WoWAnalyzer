import CoreMitigationCheck from 'parser/core/modules/MitigationCheck';
import SPELLS from 'common/SPELLS';


class MitigationCheck extends CoreMitigationCheck {
  constructor(...args){
    super(...args);
    this.buffCheck = [SPELLS.IRONSKIN_BREW_BUFF.id,
                      SPELLS.FORTIFYING_BREW_BRM_BUFF.id,
                      SPELLS.ZEN_MEDITATION.id,
                      SPELLS.DAMPEN_HARM_TALENT.id];
    this.debuffCheck = [SPELLS.BREATH_OF_FIRE_DEBUFF.id];
  }
}

export default MitigationCheck;
