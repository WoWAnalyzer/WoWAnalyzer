import SPELLS from 'common/SPELLS';
import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';

class MitigationCheck extends CoreMitigationCheck {
  constructor(...args) {
    super(...args);
    this.buffCheckPhysical = [SPELLS.IRONFUR.id];

    this.buffCheckPhysAndMag = [
      SPELLS.FRENZIED_REGENERATION.id,
      SPELLS.BARKSKIN.id,
      SPELLS.SURVIVAL_INSTINCTS.id,
    ];
  }
}

export default MitigationCheck;
