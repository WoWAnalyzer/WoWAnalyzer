import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { Options } from 'parser/core/Analyzer';
import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';

class MitigationCheck extends CoreMitigationCheck {
  constructor(options: Options) {
    super(options);

    this.buffCheckPhysical = [SPELLS.BONE_SHIELD.id, SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF.id];
    this.buffCheckMagical = [SPELLS.ANTI_MAGIC_SHELL.id];
    this.buffCheckPhysAndMag = [
      SPELLS.BLOOD_SHIELD.id,
      TALENTS.VAMPIRIC_BLOOD_TALENT.id,
      TALENTS.ICEBOUND_FORTITUDE_TALENT.id,
      TALENTS.TOMBSTONE_TALENT.id,
    ];
  }
}

export default MitigationCheck;
