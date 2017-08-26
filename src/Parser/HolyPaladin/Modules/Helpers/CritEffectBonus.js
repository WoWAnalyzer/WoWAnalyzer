import SPELLS from 'common/SPELLS';

import CoreCritEffectBonus from 'Parser/Core/Modules/Helpers/CritEffectBonus';

class CritEffectBonus extends CoreCritEffectBonus {
  getBonus(event) {
    // Purity of Light (Tier 21 4 set) is multiplicative, so with it Drape of Shame's increase becomes 10%. Because of this we don't need to do anything here to keep it accurate.

    let critModifier = super.getBonus(event);
    if (event.ability.guid === SPELLS.HOLY_SHOCK_HEAL.id) {
      const shockTreatmentTraits = this.owner.selectedCombatant.traitsBySpellId[SPELLS.SHOCK_TREATMENT.id];
      // Shock Treatment increases critical healing of Holy Shock by 8%: http://www.wowhead.com/spell=200315/shock-treatment
      // This critical healing works on both the regular part and the critical part (unlike Drape of Shame), so we double it.
      critModifier += shockTreatmentTraits * 0.08 * 2;
    }
    return critModifier;
  }
}

export default CritEffectBonus;
