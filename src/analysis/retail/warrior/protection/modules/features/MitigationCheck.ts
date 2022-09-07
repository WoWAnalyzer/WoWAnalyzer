import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';

class MitigationCheck extends CoreMitigationCheck {
  constructor(options: Options) {
    super(options);
    this.buffCheckPhysical = [SPELLS.SHIELD_BLOCK_BUFF.id];
    this.buffCheckMagical = [SPELLS.SPELL_REFLECTION.id];
    this.buffCheckPhysAndMag = [SPELLS.IGNORE_PAIN.id, SPELLS.LAST_STAND.id, SPELLS.SHIELD_WALL.id];

    this.debuffCheckPhysAndMag = [SPELLS.DEMORALIZING_SHOUT.id];
  }
}

export default MitigationCheck;
