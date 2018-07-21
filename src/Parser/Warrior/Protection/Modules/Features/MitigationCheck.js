import CoreMitigationCheck from 'Parser/Core/Modules/MitigationCheck';
import SPELLS from 'common/SPELLS';


class MitigationCheck extends CoreMitigationCheck {
  constructor(...args){
    super(...args);
    this.buffCheck = [SPELLS.SHIELD_BLOCK_BUFF.id,
                      SPELLS.IGNORE_PAIN.id,
                      SPELLS.LAST_STAND.id,
                      SPELLS.SHIELD_WALL.id,
                      SPELLS.SPELL_REFLECTION.id];
    this.debuffCheck = [SPELLS.DEMORALIZING_SHOUT.id];
  }
}

export default MitigationCheck;
