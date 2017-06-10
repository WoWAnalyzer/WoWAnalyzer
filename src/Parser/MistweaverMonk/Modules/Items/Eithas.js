import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

const debug = false;

class Eithas extends Module {
  healing = 0;
  vivTarget = null;
  vivUTBuff = false;
  totalVivHeal = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasFeet(ITEMS.EITHAS_LUNAR_GLIDES.id);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.VIVIFY.id && this.owner.selectedCombatant.hasBuff(SPELLS.UPLIFTING_TRANCE_BUFF.id)) {
      this.vivTarget = event.targetID;
      this.vivUTBuff = true;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.VIVIFY.id && event.targetID !== this.vivTarget && this.vivUTBuff === true) {
      this.healing += event.amount;
      this.healing += event.overheal || 0;
      this.vivUTBuff = false;
    }

    if(debug) {
      if(spellId === SPELLS.VIVIFY.id && event.targetID === this.vivTarget) {
        this.totalVivHeal += event.amount;
        this.totalVivHeal += event.overheal || 0;
      }
    }
  }

  on_finished() {
    this.healing = this.healing / 3;
    if(debug) {
      console.log('Boot Healing: ' + this.healing);
      console.log('Viv Target Healing: ' + this.totalVivHeal);
      console.log('Total Healing: ' + (this.totalVivHeal + this.healing));
    }
  }
}

export default Eithas;
