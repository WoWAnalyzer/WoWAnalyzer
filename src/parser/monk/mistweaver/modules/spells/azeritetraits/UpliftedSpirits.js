import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import { calculateAzeriteEffects } from 'common/stats';
import SPELLS from 'common/SPELLS';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import HIT_TYPES from 'game/HIT_TYPES';
import AzeritePowerStatistic from 'interface/statistics/AzeritePowerStatistic';
import SpellLink from 'common/SpellLink';
import Uptime from 'interface/icons/Uptime';

import StatTracker from 'parser/shared/modules/StatTracker';
import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';

import { VIVIFY_SPELLPOWER_COEFFICIENT, VIVIFY_REM_SPELLPOWER_COEFFICIENT } from '../../../constants';

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
    const ranks = this.selectedCombatant.traitRanks(SPELLS.UPLIFTED_SPIRITS.id) || [];
    this.traitRawHealing = ranks.reduce((total, rank) => total + calculateAzeriteEffects(SPELLS.UPLIFTED_SPIRITS.id, rank)[0], 0);
  }
  cooldownReductionUsed = 0;
  cooldownReductionWasted = 0;
  healing = 0;
  castTarget = null;
  traitRawHealing = 0;

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VIVIFY.id) {
      return;
    }

    this.castTarget = event.castEvent && event.castEvent.targetID;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

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

    // Azerite Trait Healing Increase
    // fix for report/yFpzQTVCZ9Ht27ba/
    const vivifyCoefficient = event.targetID === this.castTarget ? VIVIFY_SPELLPOWER_COEFFICIENT : VIVIFY_REM_SPELLPOWER_COEFFICIENT;
    const currentIntellect = this.statTracker.currentIntellectRating;
    const initialHitHealing = vivifyCoefficient * currentIntellect;
    const traitComponent = this.traitRawHealing / (initialHitHealing + this.traitRawHealing);

    const healAmount = event.amount + (event.absorbed || 0);
    const overhealAmount = (event.overheal || 0);
    const raw = healAmount + overhealAmount;
    const relativeHealingFactor = 1 + traitComponent;
    const relativeHealing = raw - raw / relativeHealingFactor;

    this.healing += Math.max(0, relativeHealing - overhealAmount);

    this.castTarget = null; // need to reset this as vivify can hit your target twice with different coefficients
  }

  statistic() {
    return (
      <AzeritePowerStatistic
        size="flexible"
        tooltip={(
          <>
            Added a total of {formatNumber(this.healing)} to your Vivify.<br />
            You wasted {this.cooldownReductionWasted / 1000 || 0} seconds of cooldown reduction.
          </>
        )}
      >
        <div className="pad">
          <label><SpellLink id={SPELLS.UPLIFTED_SPIRITS.id} /></label>

          <div className="value" style={{ marginTop: 15 }}>
            <img
              src="/img/healing.png"
              alt="Healing"
              className="icon"
            /> {formatPercentage(this.healing / this.getAbility(SPELLS.VIVIFY.id).healingEffective)}% <small>of Vivify Healing</small>
          </div>
          <div className="value" style={{ marginTop: 5 }}>
            <Uptime /> {formatNumber(this.cooldownReductionUsed / 1000) || 0} <small>Revival Seconds Reduced</small>
          </div>
        </div>
      </AzeritePowerStatistic>
    );
  }
}

export default UpliftedSpirits;
