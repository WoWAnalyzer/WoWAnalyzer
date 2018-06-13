import SPELLS from 'common/SPELLS';
import CoreSpellUsable from 'Parser/Core/Modules/SpellUsable';
import Combatants from 'Parser/Core/Modules/Combatants';
import T20_2set from 'Parser/Warlock/Demonology/Modules/Items/T20_2set';


const PROC_SPELLS = [
  SPELLS.DEMONBOLT_TALENT.id,
  SPELLS.SHADOW_BOLT.id,
  SPELLS.DEMONWRATH_CAST.id,
];

class SpellUsable extends CoreSpellUsable{


  lastPotentialTrigger = null;

  static dependencies = {
    ...CoreSpellUsable.dependencies,
    combatants: Combatants,
    t20_2set: T20_2set,
  };

  on_initialized(){
    this.has2set = this.combatants.selected.hasBuff(SPELLS.WARLOCK_DEMO_T20_2P_BONUS.id);
  }

  on_byPlayer_cast(event){
    if(super.on_byPlayer_cast){
      super.on_byPlayer_cast(event);
    }

    const spellId = event.ability.guid;
    if(this.has2set && PROC_SPELLS.includes(spellId)){
        this.lastPotentialTrigger = event.timestamp;
    } else if(spellId === SPELLS.CALL_DREADSTALKERS.id){
      this.lastPotentialTrigger = null;
    }
  }

  beginCooldown(spellId, timestamp){
    if(spellId === SPELLS.CALL_DREADSTALKERS.id && this.isOnCooldown(spellId)){
      this.endCooldown(spellId, undefined, this.lastPotentialTrigger ? this.lastPotentialTrigger : undefined);
    }
    super.beginCooldown(spellId, timestamp);
  }
}

export default SpellUsable;
