import React from 'react';

import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'parser/core/modules/AbilityTracker';
import SpellUsable from 'parser/core/modules/SpellUsable';
import HIT_TYPES from 'parser/core/HIT_TYPES';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticBox from 'interface/others/StatisticBox';

import StatTracker from 'parser/core/modules/StatTracker';
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/core/modules/Combatants';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

import { MISTWEAVER_HEALING_AURA, VIVIFY_SPELLPOWER_COEFFICIENT, VIVIFY_REM_SPELLPOWER_COEFFICIENT } from '../../../Constants';

const UPLIFTED_SPIRITS_REDUCTION = 1000;

class UpliftedSpirits extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
    abilityTracker: AbilityTracker,
    spellUsable: SpellUsable,
  };

  getAbility = spellId => this.abilityTracker.getAbility(spellId);

  /**
   * Your Vivify heals for an additional 309. Vivify critical heals reduce the cooldown of your Revival by 1 sec.
   */
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrait(SPELLS.UPLIFTED_SPIRITS.id);
  }

  cooldownReductionUsed = 0;
  cooldownReductionWasted = 0;
  healing = 0;

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    let critMod = 1;

    if (spellId !== SPELLS.VIVIFY.id) {
      return;
    }

    // Cooldown Reduction on Revival
    if (event.hitType === HIT_TYPES.CRIT) {
      if (this.spellUsable.isOnCooldown(SPELLS.REVIVAL.id)) {
        this.cooldownReductionUsed += this.spellUsable.reduceCooldown(SPELLS.REVIVAL.id, UPLIFTED_SPIRITS_REDUCTION);
      } else {
        this.cooldownReductionWasted += UPLIFTED_SPIRITS_REDUCTION;
      }
    }

    if (event.overheal > 0) { // Exit as spell has overhealed and no need for adding in the additional healing from the trait
      return;
    }

    if (event.hitType === HIT_TYPES.CRIT) {
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


  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.OPTIONAL(70)}
        icon={<SpellIcon id={SPELLS.UPLIFTED_SPIRITS.id} />}
        value={`${formatNumber(this.cooldownReductionUsed / 1000) || 0}`}
        label={(
          <dfn data-tip={`You wasted ${this.cooldownReductionWasted / 1000 || 0} seconds of cooldown reduction.`}
          >
            Revival Seconds Reduced
          </dfn>
        )}
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.UPLIFTED_SPIRITS.id} />}
        value={<dfn data-tip={`Added a total of ${formatNumber(this.healing)} to your Vivify.`}>{formatPercentage(this.healing / this.getAbility(SPELLS.VIVIFY.id).healingEffective)} % of Vivify Healing</dfn>}
      />
    );
  }
}

export default UpliftedSpirits;
