import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';
import SPELLS from 'common/SPELLS';


class MitigationCheck extends CoreMitigationCheck {
  constructor(...args) {
    super(...args);

    this.buffCheckPhysical = [
      SPELLS.BONE_SHIELD.id,
      SPELLS.DANCING_RUNE_WEAPON_BUFF.id,
    ];
    this.buffCheckMagical = [
      SPELLS.ANTI_MAGIC_SHELL.id,
    ];
    this.buffCheckPhysAndMag = [
      SPELLS.BLOOD_SHIELD.id,
      SPELLS.VAMPIRIC_BLOOD.id,
      SPELLS.ICEBOUND_FORTITUDE.id,
      SPELLS.TOMBSTONE_TALENT.id,
    ];
  }
}

export default MitigationCheck;
