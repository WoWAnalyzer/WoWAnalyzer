import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class Dreamwalker extends Module {

  healing = 0;
  hasTrait = false;
  on_initialized() {
    if (!this.owner.error) {
      if(this.owner.selectedCombatant.traitsBySpellId[SPELLS.DREAMWALKER_TRAIT.id]>0) {
        this.hasTrait = true;
      }
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (SPELLS.DREAMWALKER.id !== spellId) {
      return;
    }
    this.healing += event.amount;
  }

}

export default Dreamwalker;
