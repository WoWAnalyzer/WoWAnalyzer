import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const debug = false;

class AOEHealingTracker extends Module {
  // Implement Mists of Sheilun, Celestial Breath, and Refreshing Jade Wind

  procsMistsOfSheilun = 0;
  healsMistsOfSheilun = 0;
  healingMistsOfSheilun = 0;
  overhealingMistsOfSheilun = 0;

  procsCelestialBreath = 0;
  procsCelestialBreathRemove = 0;
  healsCelestialBreath = 0;
  healingCelestialBreath = 0;
  overhealingCelestialBreath = 0;

  healsRJW = 0;
  healingRJW = 0;
  overhealingRJW = 0;
  castRJW = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.MISTS_OF_SHEILUN_BUFF.id) {
      this.procsMistsOfSheilun++;
    }
    if(spellId === SPELLS.CELESTIAL_BREATH_BUFF.id) {
      this.procsCelestialBreath++;
    }
    if(spellId === SPELLS.REFRESHING_JADE_WIND_TALENT.id) {
      this.castRJW++;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.MISTS_OF_SHEILUN.id) {
      this.healsMistsOfSheilun++;
      this.healingMistsOfSheilun += event.amount;
      if(event.overheal) {
        this.overhealingMistsOfSheilun += event.overheal;
      }
    }

    if(spellId === SPELLS.REFRESHING_JADE_WIND_HEAL.id) {
      this.healsRJW++;
      this.healingRJW += event.amount;
      if(event.overheal) {
        this.overhealingRJW += event.amount;
      }
    }

    if(spellId === SPELLS.CELESTIAL_BREATH.id) {
      this.healsCelestialBreath++;
      this.healingCelestialBreath += event.amount;
      if(event.overheal) {
        this.overhealingCelestialBreath += event.overheal;
      }
    }
  }


  on_finished() {
    if(debug) {
      console.log('Mists of Sheilun Procs: ' + this.procsMistsOfSheilun);
      console.log('Avg Heals per Procs: ' + (this.healsMistsOfSheilun / this.procsMistsOfSheilun));
      console.log('Avg Heals Amount: ' + (this.healingMistsOfSheilun / this.healsMistsOfSheilun));
      console.log('Celestial Breath Procs: ' + this.procsCelestialBreath);
      console.log('Avg Heals per Procs: ' + (this.healsCelestialBreath / this.procsCelestialBreath));
      console.log('Avg Heals Amount: ' + (this.healingCelestialBreath / this.healsCelestialBreath));
      console.log('RJW Casts: ' + this.castRJW);
      console.log('RJW Targets Hit: ' + this.healsRJW);
      console.log('Avg Heals per Procs: ' + (this.healingRJW / this.castRJW));
      console.log('Avg Heals Amount: ' + (this.healingRJW / this.healsRJW));
    }
  }
}

export default AOEHealingTracker;
