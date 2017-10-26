import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

class MistsOfSheilun extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  procsMistsOfSheilun = 0;
  healsMistsOfSheilun = 0;
  healingMistsOfSheilun = 0;
  overhealingMistsOfSheilun = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.MISTS_OF_SHEILUN_TRAIT.id] === 1;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.MISTS_OF_SHEILUN_BUFF.id) {
      this.procsMistsOfSheilun += 1;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.MISTS_OF_SHEILUN.id) {
      this.healsMistsOfSheilun += 1;
      this.healingMistsOfSheilun += event.amount;
      if (event.overheal) {
        this.overhealingMistsOfSheilun += event.overheal;
      }
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Mists of Sheilun Procs: ${this.procsMistsOfSheilun}`);
      console.log(`Avg Heals per Procs: ${this.healsMistsOfSheilun / this.procsMistsOfSheilun}`);
      console.log(`Avg Heals Amount: ${this.healingMistsOfSheilun / this.healsMistsOfSheilun}`);
    }
  }
}

export default MistsOfSheilun;
