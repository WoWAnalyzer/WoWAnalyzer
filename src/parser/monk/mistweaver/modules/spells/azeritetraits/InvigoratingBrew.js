import React from 'react';

import SpellLink from 'common/SpellLink';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import HIT_TYPES from 'parser/core/HIT_TYPES';

import StatTracker from 'parser/shared/modules/StatTracker';
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { MISTWEAVER_HEALING_AURA, VIVIFY_SPELLPOWER_COEFFICIENT } from '../../../constants';


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
  targetId = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (spellId !== SPELLS.VIVIFY.id) {
      return;
    }

    if (this.selectedCombatant.hasBuff(SPELLS.THUNDER_FOCUS_TEA.id)) {
      this.targetId = targetId;
    }

  }
  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (event.overheal > 0) { // Exit as spell has overhealed and no need for adding in the additional healing from the trait
      return;
    }

    if (spellId === SPELLS.VIVIFY.id && this.targetId === targetId) {
      const versPerc = this.statTracker.currentVersatilityPercentage;
      const mwAura = MISTWEAVER_HEALING_AURA;
      const intRating = this.statTracker.currentIntellectRating;
      const healAmount = event.amount + (event.absorbed || 0);

      this.baseHeal = (intRating * VIVIFY_SPELLPOWER_COEFFICIENT) * mwAura * (1 + versPerc);

      if (event.hitType === HIT_TYPES.CRIT) {
        this.baseHeal = this.baseHeal * 2;
      }
      this.healing += (healAmount - this.baseHeal);
      this.targetId = 0; // Zero out TargetID for next spell cast
    }
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.INVIGORATING_BREW.id} />}
        value={<dfn data-tip={`Added a total of ${formatNumber(this.healing)} to your Vivify.`}>{formatPercentage(this.healing / this.getAbility(SPELLS.VIVIFY.id).healingEffective)} % of Vivify Healing</dfn>}
      />
    );
  }
}

export default InvigoratingBrew;
