import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

class ChiBurst extends Module {
  castChiBurst = 0;
  healing = 0;
  targetsChiBurst = 0;

  on_initialized(){
    if(!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.CHI_BURST_TALENT.id);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.CHI_BURST_TALENT.id) {
      this.castChiBurst++;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (!this.owner.combatants.players[targetId]) {
      return;
    }

    if(spellId === SPELLS.CHI_BURST_HEAL.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.targetsChiBurst++;
    }
  }

  on_finished() {
    if(debug) {
      console.log('ChiBurst Casts: ' + this.castChiBurst);
      console.log('Total Chi Burst Healing: ' + this.healing);
      console.log('Chi Burst Targets Hit: ' + this.targetsChiBurst);
    }
  }
}

export default ChiBurst;
