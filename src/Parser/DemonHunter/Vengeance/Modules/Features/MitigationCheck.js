import CoreMitigationCheck from 'Parser/Core/Modules/MitigationCheck';
import SPELLS from 'common/SPELLS';


class MitigationCheck extends CoreMitigationCheck {
  constructor(...args){
    super(...args);
    this.buffCheck = [SPELLS.DEMON_SPIKES_BUFF.id,
                      SPELLS.METAMORPHOSIS_TANK.id];
    this.debuffCheck = [SPELLS.FIERY_BRAND_DEBUFF.id];
  }
}

export default MitigationCheck;
