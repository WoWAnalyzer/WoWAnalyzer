import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';
import SPELLS from 'common/SPELLS';


class MitigationCheck extends CoreMitigationCheck {
  constructor(...args){
    super(...args);
    this.buffCheckPhysAndMag = [
      SPELLS.IRONSKIN_BREW_BUFF.id,
      SPELLS.FORTIFYING_BREW_BRM_BUFF.id,
      SPELLS.ZEN_MEDITATION.id,
      SPELLS.DAMPEN_HARM_TALENT.id,
    ];
  }
}

export default MitigationCheck;
