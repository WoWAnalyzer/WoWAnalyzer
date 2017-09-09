import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

export const EKOWRAITH_ITEM_ID = 137015;
const GUARDIAN_DAMAGE_REDUCTION = 0.06;
const EKOWRAITH_INCREASED_EFFECT = 1.75;

class Ekowraith extends Module {
  healing = 0;
  damageReductionHealing = 0;
  hasGuardianAffinity = false;

  on_initialized() {
    this.hasGuardianAffinity = this.owner.modules.combatants.selected.lv45Talent === 197491;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.YSERAS_GIFT_1.id || spellId === SPELLS.YSERAS_GIFT_2.id) {
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
