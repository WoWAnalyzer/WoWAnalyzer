import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = true;

class ConcordanceOfTheLegionfall extends Module {
  concordanceHealing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.concordanceTraits = this.owner.selectedCombatant.traitsBySpellId[SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_TRAIT.id] || 0;
    }
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_BUFF.id) {
      this.concordanceActive = true;
    }
  }

  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.CONCORDANCE_OF_THE_LEGIONFALL_BUFF.id) {
      this.concordanceActive = false;
    }
  }

  on_byPlayer_heal(event) {
    if(this.concordanceTraits > 0 && this.concordanceActive) {
      this.concordanceHealing += event.amount;
      this.concordanceHealing += event.absorbed || 0;
    }
  }

  on_finished() {
    if(debug) {
      console.log('Concordance Impact: ' + this.concordanceHealing);
    }
  }

}

export default ConcordanceOfTheLegionfall;
