import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

import CritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';

export const DRAPE_OF_SHAME_CRIT_EFFECT = 0.05;

class ShockTreatment extends Module {
  static dependencies = {
    critEffectBonus: CritEffectBonus,
  };

  rank = 0;
  on_initialized() {
    this.rank = this.owner.selectedCombatant.traitsBySpellId[SPELLS.SHOCK_TREATMENT.id];
    this.active = this.rank > 0;

    if (this.active) {
      this.critEffectBonus.hook(this.getCritEffectBonus.bind(this));
    }
  }

  getCritEffectBonus(critEffectModifier, event) {
    if (event.ability.guid === SPELLS.HOLY_SHOCK_HEAL.id) {
      // Shock Treatment increases critical healing of Holy Shock by 8%: http://www.wowhead.com/spell=200315/shock-treatment
      // This critical healing works on both the regular part and the critical part (unlike Drape of Shame), so we double it.
      critEffectModifier += this.rank * 0.08 * 2;
    }
    return critEffectModifier;
  }
}

export default ShockTreatment;
