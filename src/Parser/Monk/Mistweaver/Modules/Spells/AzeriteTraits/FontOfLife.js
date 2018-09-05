import SPELLS from 'common/SPELLS';

import StatTracker from 'Parser/Core/Modules/StatTracker';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import { MISTWEAVER_HEALING_AURA, ESSENCE_FONT_SPELLPOWER_COEFFICIENT } from '../../../Constants';

class FontOfLife extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
  };

  /**
   * Your Essence Font's initial heal is increased by 150 and has a chance to reduce the cooldown of Thunder Focus Tea by 1 sec.
   */
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.FONT_OF_LIFE.id);
  }

  healing = 0;
  baseHeal = 0

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (event.overheal > 0) { // Exit as spell has overhealed and no need for adding in the additional healing from the trait
      return;
    }

    if (spellId === SPELLS.ESSENCE_FONT_BUFF.id && event.tick !== true) {
      const versPerc = this.statTracker.currentVersatilityPercentage;
      const mwAura = MISTWEAVER_HEALING_AURA;
      const intRating = this.statTracker.currentIntellectRating;
      const healAmount = event.amount + (event.absorbed || 0);

      this.baseHeal = (intRating * ESSENCE_FONT_SPELLPOWER_COEFFICIENT) * mwAura * (1 + versPerc);

      if (event.hitType === 2) {
        this.baseHeal = this.baseHeal * 2;
      }
      this.healing += (healAmount - this.baseHeal);
    }
  }
}

export default FontOfLife;
