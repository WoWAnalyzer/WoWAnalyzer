import Analyzer from 'parser/core/Analyzer';
import SPELLS from "common/SPELLS/shaman";
import SpellUsable from 'parser/core/modules/SpellUsable';

class FireElemental extends Analyzer {

  static dependencies = {
    spellUsable:SpellUsable,
  };

  last_pet_summon_timeStamp=null;


  on_byPlayerPet_damage(event) {
      const spellId = event.ability.guid;
      if (spellId !== SPELLS.FIRE_ELEMENTAL_FIRE_BLAST.id) {
        return;
      }
      if(this.last_pet_summon_timeStamp===null){
        this.spellUsable.beginCooldown(SPELLS.FIRE_ELEMENTAL.id);
        this.last_pet_summon_timeStamp=event.timestamp;
      }
  }
  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SUMMON_FIRE_ELEMENTAL.id) {
      return;
    }
    this.last_pet_summon_timeStamp=event.timestamp;
  }
}

export default FireElemental;
