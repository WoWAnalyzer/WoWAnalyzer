import SPELLS from 'common/SPELLS';
import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';

class MitigationCheck extends CoreMitigationCheck {
  constructor(...args) {
    super(...args);

    this.buffCheckPhysical = [SPELLS.DEMON_SPIKES_BUFF.id];
    this.buffCheckPhysAndMag = [SPELLS.METAMORPHOSIS_TANK.id];

    this.debuffCheckPhysAndMag = [SPELLS.FIERY_BRAND_DEBUFF.id];
  }
}

export default MitigationCheck;
