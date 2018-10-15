import Analyzer from 'parser/core/Analyzer';
import SPELLS from "common/SPELLS/shaman";
import TALENTS from "common/SPELLS/talents/shaman";
import SpellUsable from 'parser/shared/modules/SpellUsable';

class StormFireElemental extends Analyzer {

  static dependencies = {
    spellUsable:SpellUsable,
  };

  last_pet_summon_timeStamp=null;

  summon_spell = this.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT.id) ? 192249 : SPELLS.FIRE_ELEMENTAL.id;


  on_byPlayerPet_damage(event){
      if(this.last_pet_summon_timeStamp===null){
        this.spellUsable.beginCooldown(this.summon_spell, event.timestamp);
        this.last_pet_summon_timeStamp=event.timestamp;
      }
  }
  on_byPlayer_summon(event) {
    const spellId = event.ability.guid;
    if (spellId !== this.summon_spell) {
      return;
    }
    this.last_pet_summon_timeStamp=event.timestamp;
  }
}

export default StormFireElemental;
