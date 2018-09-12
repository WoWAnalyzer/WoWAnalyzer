
import SPELLS from 'common/SPELLS';

import StatTracker from 'Parser/Core/Modules/StatTracker';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import { MISTWEAVER_HEALING_AURA, VIVIFY_SPELLPOWER_COEFFICIENT, VIVIFY_REM_SPELLPOWER_COEFFICIENT } from '../../../Constants';

class UpliftedSpirits extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  /**
   * Your Vivify heals for an additional 309. Vivify critical heals reduce the cooldown of your Revival by 1 sec.
   */
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.UPLIFTED_SPIRITS.id);
  }

  healing = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    let critMod = 1;

    if (event.overheal > 0) { // Exit as spell has overhealed and no need for adding in the additional healing from the trait
      return;
    }

    if (spellId !== SPELLS.VIVIFY.id) {
      return;
    }

    if (event.hitType === 2) {
      critMod = 2;
    }

    // Azerite Trait Healing Increase
    const versPerc = this.statTracker.currentVersatilityPercentage;
    const mwAura = MISTWEAVER_HEALING_AURA;
    const intRating = this.statTracker.currentIntellectRating;
    const healAmount = event.amount + (event.absorbed || 0);

    this.baseHeal = (intRating * VIVIFY_SPELLPOWER_COEFFICIENT) * mwAura * (1 + versPerc) * critMod;

    if ((healAmount - this.baseHeal) < 0) { // Need to account for Vivify from REM 'Causes a surge of invigorating mists, healing the target for (95% of Spell power) and all allies with your Renewing Mist active for (70% of Spell power)'
      this.baseHeal = (intRating * VIVIFY_REM_SPELLPOWER_COEFFICIENT) * mwAura * (1 + versPerc) * critMod;
      this.healing += (healAmount - this.baseHeal);
    } else {
      this.healing += (healAmount - this.baseHeal);
    }
  }
}

export default UpliftedSpirits;
