import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import HealingDone from 'Parser/Core/Modules/HealingDone';

const debug = false;

class ChiJi extends Analyzer {
  static dependencies = {
    healingDone: HealingDone,
  };

  petID = null;
  _pets = {};
  healing = 0;
  overHealing = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id);
    this._pets = this.owner.report.friendlyPets.filter(pet => pet.petOwner === this.owner.player.id);
  }

  on_byPlayer_summon(event) {
    if (event.ability.guid === SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id) {
      this.petID = event.targetID;
      debug && console.log(`Chi-Ji Summoned: ${this.petID}`);
    }
  }

  on_heal(event) {
    if (event.sourceID === this.petID && event.ability.guid === SPELLS.CRANE_HEAL.id) {
      this.healingDone._total = this.healingDone._total.add(event.amount || 0, event.absorbed || 0, event.overheal || 0);

      this.healing += (event.amount || 0) + (event.absorbed || 0);
      this.overHealing += event.overheal || 0;
      this.casts += 1;
    }
  }

  get chiJiOverHealing() {
    return (this.overHealing / (this.healing + this.overHealing)).toFixed(4) || 0;
  }

  on_finished() {
    if (debug) {
      console.log(`Chi-Ji ID: ${this.petID}`);
    }
  }
}

export default ChiJi;
