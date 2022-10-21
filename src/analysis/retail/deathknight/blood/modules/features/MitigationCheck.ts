import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';

class MitigationCheck extends CoreMitigationCheck {
  constructor(options: Options) {
    super(options);

    this.buffCheckPhysical = [SPELLS.BONE_SHIELD.id, SPELLS.DANCING_RUNE_WEAPON_BUFF.id];
    this.buffCheckMagical = [talents.ANTI_MAGIC_SHELL_TALENT.id];
    this.buffCheckPhysAndMag = [
      SPELLS.BLOOD_SHIELD.id,
      SPELLS.VAMPIRIC_BLOOD.id,
      talents.ICEBOUND_FORTITUDE_TALENT.id,
      SPELLS.TOMBSTONE_TALENT.id,
    ];
  }
}

export default MitigationCheck;
