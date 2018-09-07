
import SPELLS from 'common/SPELLS';

import StatTracker from 'Parser/Core/Modules/StatTracker';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import { MISTWEAVER_HEALING_AURA, VIVIFY_SPELLPOWER_COEFFICIENT } from '../../../Constants';

class InvigoratingBrew extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  /**
   * Vivify does an additional 859 healing when empowered by Thunder Focus Tea.
   */
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.INVIGORATING_BREW.id);
  }

  healing = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (event.overheal > 0) { // Exit as spell has overhealed and no need for adding in the additional healing from the trait
      return;
    }

    if (spellId === SPELLS.VIVIFY.id && this.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)) {
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

export default InvigoratingBrew;
