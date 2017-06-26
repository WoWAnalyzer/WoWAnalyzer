import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const debug = false;

const EITHAS_LUNAR_GLIDES_HEALING_INCREASE = .1;

class Eithas extends Module {
  healingCleave = 0;
  healingMain = 0;
  healing = 0
  vivTarget = null;
  rawHealingCleave = 0;
  rawHealingMain = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasFeet(ITEMS.EITHAS_LUNAR_GLIDES.id);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.VIVIFY.id && this.owner.selectedCombatant.hasBuff(SPELLS.UPLIFTING_TRANCE_BUFF.id)) {
      this.vivTarget = event.targetID;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.VIVIFY.id && event.targetID !== this.vivTarget && this.owner.selectedCombatant.hasBuff(SPELLS.UPLIFTING_TRANCE_BUFF.id, event.timestamp, 32, 0)) {
      this.healingCleave += calculateEffectiveHealing(event, EITHAS_LUNAR_GLIDES_HEALING_INCREASE);
      this.rawHealingCleave += (event.amount || 0) + (event.absorbed || 0);
    }
    if(spellId === SPELLS.VIVIFY.id && event.targetID === this.vivTarget && this.owner.selectedCombatant.hasBuff(SPELLS.UPLIFTING_TRANCE_BUFF.id, event.timestamp, 32, 0)) {
      this.healingMain += calculateEffectiveHealing(event, EITHAS_LUNAR_GLIDES_HEALING_INCREASE);
      this.rawHealingMain += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_finished() {
    this.healing = this.healingCleave + this.healingMain + ((this.rawHealingCleave + this.healingCleave) / 3);
    if(debug) {
      console.log('Boot Healing: ' + this.rawHealingCleave);
      console.log('Viv Target Healing: ' + this.rawHealingMain);
      console.log('Total Healing: ' + (this.totalVivHeal + this.healing));
    }
  }
}

export default Eithas;
