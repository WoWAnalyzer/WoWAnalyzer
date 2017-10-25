import SPELLS from 'common/SPELLS';

import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';


const debug = false;

class CelestialBreath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  procsCelestialBreath = 0;
  procsCelestialBreathRemove = 0;
  healsCelestialBreath = 0;
  healingCelestialBreath = 0;
  overhealingCelestialBreath = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.CELESTIAL_BREATH_TRAIT.id] === 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.CELESTIAL_BREATH_BUFF.id) {
      this.procsCelestialBreath += 1;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.CELESTIAL_BREATH.id) {
      this.healsCelestialBreath += 1;
      this.healingCelestialBreath += event.amount;
      if (event.overheal) {
        this.overhealingCelestialBreath += event.overheal;
      }
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Celestial Breath Procs: ${this.procsCelestialBreath}`);
      console.log(`Avg Heals per Procs: ${this.healsCelestialBreath / this.procsCelestialBreath}`);
      console.log(`Avg Heals Amount: ${this.healingCelestialBreath / this.healsCelestialBreath}`);
    }
  }
}

export default CelestialBreath;
