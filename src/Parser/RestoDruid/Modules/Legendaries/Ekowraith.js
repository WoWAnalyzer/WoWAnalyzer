import Module from 'Main/Parser/Module';
import { YSERAS_GIFT_HEAL_SPELL_ID, YSERAS_GIFT2_HEAL_SPELL_ID } from 'Main/Parser/Constants';

export const EKOWRAITH_ITEM_ID = 137015;
const GUARDIAN_DAMAGE_REDUCTION = 0.06;
const EKOWRAITH_INCREASED_EFFECT = 1.75;

class Ekowraith extends Module {
  healing = 0;
  damageReductionHealing = 0;
  hasGuardianAffinity = false;

  on_initialized() {
    this.hasGuardianAffinity = this.owner.selectedCombatant.lv45Talent === 197491;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === YSERAS_GIFT_HEAL_SPELL_ID || spellId === YSERAS_GIFT2_HEAL_SPELL_ID) {
      this.healing += (event.amount - (event.amount / EKOWRAITH_INCREASED_EFFECT));
      return;
    }
  }

  on_toPlayer_damage(event) {
    if(this.hasGuardianAffinity) {
      this.damageReductionHealing += event.amount * ((GUARDIAN_DAMAGE_REDUCTION * EKOWRAITH_INCREASED_EFFECT)-GUARDIAN_DAMAGE_REDUCTION);
    }
  }
}

export default Ekowraith;
