import DH_SPELLS from 'common/SPELLS/demonhunter';
import { Options } from 'parser/core/Analyzer';
import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';

class MitigationCheck extends CoreMitigationCheck {
  constructor(options: Options) {
    super(options);

    this.buffCheckPhysical = [DH_SPELLS.DEMON_SPIKES_BUFF.id];
    this.buffCheckPhysAndMag = [DH_SPELLS.METAMORPHOSIS_TANK.id];

    this.debuffCheckPhysAndMag = [DH_SPELLS.FIERY_BRAND_DEBUFF.id];
  }
}

export default MitigationCheck;
