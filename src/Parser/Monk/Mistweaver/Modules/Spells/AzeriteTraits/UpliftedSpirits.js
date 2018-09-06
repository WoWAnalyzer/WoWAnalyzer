
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import { MISTWEAVER_HEALING_AURA, VIVIFY_SPELLPOWER_COEFFICIENT } from '../../../Constants';

class UpliftedSpirits extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healBuff = 0

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

    if (event.overheal > 0) { // Exit as spell has overhealed and no need for adding in the additional healing from the trait
      return;
    }

    if (spellId === SPELLS.VIVIFY.id) {
      const versPerc = this.statTracker.currentVersatilityPercentage;
      const mwAura = MISTWEAVER_HEALING_AURA;
      const intRating = this.statTracker.currentIntellectRating;
      const healAmount = event.amount + (event.absorbed || 0);

      this.baseHeal = (intRating * VIVIFY_SPELLPOWER_COEFFICIENT) * mwAura * (1 + versPerc);

      if (event.hitType === 2) {
        this.baseHeal = this.baseHeal * 2;
      }
      this.healing += (healAmount - this.baseHeal);
    }
  }
}

export default UpliftedSpirits;
