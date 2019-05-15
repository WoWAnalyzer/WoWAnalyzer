import Analyzer from 'parser/core/Analyzer';
import SPELLS from "common/SPELLS/shaman";
import SpellUsable from 'parser/shared/modules/SpellUsable';

class LavaSurge extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  on_byPlayer_applybuff(event){
    if(event.ability.guid!==SPELLS.LAVA_SURGE.id){
      return;
    }
    if (this.spellUsable.isOnCooldown(SPELLS.LAVA_BURST.id)){
      this.spellUsable.endCooldown(SPELLS.LAVA_BURST.id);
    }
  }
}

export default LavaSurge;
