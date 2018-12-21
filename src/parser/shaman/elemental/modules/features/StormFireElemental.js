import Analyzer from 'parser/core/Analyzer';
import SPELLS from "common/SPELLS/shaman";
import TALENTS from "common/SPELLS/talents/shaman";
import SpellUsable from 'parser/shared/modules/SpellUsable';

class StormFireElemental extends Analyzer {

  static dependencies = {
    spellUsable:SpellUsable,
  };
  elementalData = {
    FireElemental: {
      summon: SPELLS.FIRE_ELEMENTAL.id,
      damageSpells: [
        SPELLS.FIRE_ELEMENTAL_FIRE_BLAST.id,
        SPELLS.FIRE_ELEMENTAL_METEOR.id,
        SPELLS.FIRE_ELEMENTAL_IMMOLATE.id,
      ],
    },
    StormElemental: {
      summon: TALENTS.STORM_ELEMENTAL_TALENT.id,
      damageSpells: [
        SPELLS.EYE_OF_THE_STORM.id,
        SPELLS.WIND_GUST.id,
        SPELLS.CALL_LIGHTNING.id,
      ],
    },
  };

  last_pet_summon_timeStamp=null;

  relevantData = this.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT.id) ? this.elementalData.StormElemental : this.elementalData.FireElemental;


  on_byPlayerPet_damage(event){
      if(this.last_pet_summon_timeStamp!==null) {
        return;
      }
      if(!this.relevantData.damageSpells.includes(event.ability.guid)) {
        return;
      }
      this.spellUsable.beginCooldown(this.relevantData.summon, this.owner.fight.start_time);
      this.last_pet_summon_timeStamp=event.timestamp;

  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== this.relevantData.summon) {
      return;
    }
    this.last_pet_summon_timeStamp=event.timestamp;
  }
}

export default StormFireElemental;
