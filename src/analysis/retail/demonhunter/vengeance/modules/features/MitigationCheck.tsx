import SPELLS from 'common/SPELLS/demonhunter';
import { Options } from 'parser/core/Analyzer';
import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';

class MitigationCheck extends CoreMitigationCheck {
  constructor(options: Options) {
    super(options);

    this.buffCheckPhysical = [SPELLS.DEMON_SPIKES_BUFF.id];
    this.buffCheckPhysAndMag = [SPELLS.METAMORPHOSIS_TANK.id];

    this.debuffCheckPhysAndMag = [SPELLS.FIERY_BRAND_DOT.id];
  }
}

export default MitigationCheck;
