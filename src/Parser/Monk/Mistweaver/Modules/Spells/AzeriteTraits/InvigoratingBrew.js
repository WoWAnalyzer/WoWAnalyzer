import React from 'react';

import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import HIT_TYPES from 'Parser/Core/HIT_TYPES';

import StatTracker from 'Parser/Core/Modules/StatTracker';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import { MISTWEAVER_HEALING_AURA, VIVIFY_SPELLPOWER_COEFFICIENT } from '../../../Constants';


class InvigoratingBrew extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
  };

  getAbility = spellId => this.abilityTracker.getAbility(spellId);

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

      if (event.hitType === HIT_TYPES.CRIT) {
        this.baseHeal = this.baseHeal * 2;
      }
      this.healing += (healAmount - this.baseHeal);
    }
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.INVIGORATING_BREW.id}>
             Invigorating Brew
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <dfn data-tip={`Added a total of ${formatNumber(this.healing)} to your Vivify.`}>
            {formatPercentage(this.healing / this.getAbility(SPELLS.VIVIFY.id).healingEffective)} % of Vivify Healing
          </dfn>
        </div>
      </div>
    );
  }
}

export default InvigoratingBrew;
