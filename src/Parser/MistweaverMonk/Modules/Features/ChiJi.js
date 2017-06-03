import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

class ChiJi extends Module {

  petID = null;
  craneHeal = 0;
  craneAbsorbedHeal = 0;
  finalChiJi = 0;


  on_initialized() {
    if(!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_TALENT.id);
    }
  }

  on_byPlayer_summon(event) {


    if(event.ability.guid === SPELLS.INVOKE_CHIJI_TALENT.id) {
      this.petID = event.targetID;
      debug && console.log('Chi-Ji Summoned: ' + this.petID);
    }
  }

  on_heal (event) {
    // debug && console.log('SOurce ID: ' + event.sourceID + ' / / / Ability GUID: ' + event.ability.guid + ' === ' + SPELLS.CRANE_HEAL.id);
    if(event.sourceID === this.petID && event.ability.guid === SPELLS.CRANE_HEAL.id) {
      this.craneHeal += event.amount;
      this.craneAbsorbedHeal += event.absorbed || 0;
      // debug && console.log('Crane Heal?');
    }
  }

  on_finished() {
    this.finalChiJi = this.craneHeal + this.craneAbsorbedHeal;
    if(debug) {
      console.log('Chi-Ji ID: ' + this.petID);
      console.log('Chi-Ji Healing: ' + this.craneHeal);
      console.log('Chi-Ji Absobed Healing: ' + this.craneAbsorbedHeal);
    }
  }
}

export default ChiJi;


// 198664 - Chi-Ji Summon
