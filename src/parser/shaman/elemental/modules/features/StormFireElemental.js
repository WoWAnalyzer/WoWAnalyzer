import Analyzer, { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from "common/SPELLS/shaman";
import TALENTS from "common/SPELLS/talents/shaman";
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events from 'parser/core/Events';

class StormFireElemental extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  elementalData = {
    FireElemental: {
      summon: SPELLS.FIRE_ELEMENTAL,
      damageSpells: [
        SPELLS.FIRE_ELEMENTAL_FIRE_BLAST.id,
        SPELLS.FIRE_ELEMENTAL_METEOR.id,
        SPELLS.FIRE_ELEMENTAL_IMMOLATE.id,
      ],
    },
    StormElemental: {
      summon: TALENTS.STORM_ELEMENTAL_TALENT,
      damageSpells: [
        SPELLS.EYE_OF_THE_STORM.id,
        SPELLS.WIND_GUST.id,
        SPELLS.CALL_LIGHTNING.id,
      ],
    },
  };

  lastPetSummonTimeStamp = null;

  relevantData = this.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT.id) ? this.elementalData.StormElemental : this.elementalData.FireElemental;

  constructor(options){
    super(options);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.relevantData.summon), this.onCast);
  }

  onPetDamage(event){
      if(this.lastPetSummonTimeStamp!==null) {
        return;
      }
      if(!this.relevantData.damageSpells.includes(event.ability.guid)) {
        return;
      }
      this.spellUsable.beginCooldown(this.relevantData.summon.id, {
        timestamp: this.owner.fight.start_time,
      });
      this.lastPetSummonTimeStamp=event.timestamp;

  }
  onCast(event) {
    this.lastPetSummonTimeStamp=event.timestamp;
  }
}

export default StormFireElemental;
