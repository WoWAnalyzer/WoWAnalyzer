import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import { ABILITIES_AFFECTED_BY_HEALING_INCREASES } from '../../Constants';

class LightOfTuure extends Module {
  _lotTargets = {};
  buffHealing = 0;
  spellHealing = 0;

  on_initialized() {
    this.lotTraits = this.owner.selectedCombatant.traitsBySpellId[SPELLS.CARESS_OF_THE_NAARU_TRAIT.id] || 0;
    this.lotModifier = 0.25 + (0.05 * this.lotTraits);
    this.active = this.owner.selectedCombatant.traitsBySpellId[SPELLS.LIGHT_OF_TUURE_TRAIT.id] > 0;
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LIGHT_OF_TUURE_TRAIT.id) {
      this._lotTargets[event.targetID] = event.timestamp + (SPELLS.LIGHT_OF_TUURE_TRAIT.duration * 1000);
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LIGHT_OF_TUURE_TRAIT.id) {
      this._lotTargets[event.targetID] = event.timestamp + (SPELLS.LIGHT_OF_TUURE_TRAIT.duration * 1000);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.LIGHT_OF_TUURE_TRAIT.id) {
      this.spellHealing += event.amount;
    }

    if (event.targetID in this._lotTargets && event.timestamp < this._lotTargets[event.targetID]) {
      if (ABILITIES_AFFECTED_BY_HEALING_INCREASES.indexOf(spellId) === -1) {
        return;
      }

      this.buffHealing += calculateEffectiveHealing(event, this.lotModifier);
    }
  }
}


export default LightOfTuure;
