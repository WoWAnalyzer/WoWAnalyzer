import CoreMitigationCheck from 'parser/shared/modules/MitigationCheck';
import SPELLS from 'common/SPELLS';


class MitigationCheck extends CoreMitigationCheck {
  constructor(...args){
    super(...args);
    this.buffCheckPhysical = [
      SPELLS.SHIELD_BLOCK_BUFF.id,
    ];
    this.buffCheckMagical = [
      SPELLS.SPELL_REFLECTION,
    ];
    this.buffCheckPhysAndMag = [
      SPELLS.IGNORE_PAIN.id,
      SPELLS.LAST_STAND.id,
      SPELLS.SHIELD_WALL.id,
    ];

    this.debuffCheckPhysAndMag = [
      SPELLS.DEMORALIZING_SHOUT.id,
    ];
  }
}

export default MitigationCheck;
