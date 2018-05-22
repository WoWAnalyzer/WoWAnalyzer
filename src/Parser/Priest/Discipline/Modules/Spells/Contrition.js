import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Combatants from 'Parser/Core/Modules/Combatants';
import StatTracker from 'Parser/Core/Modules/StatTracker';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage, formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';

import Penance from '../Spells/Penance';
import { OffensivePenanceBoltEstimation } from '../../SpellCalculations';

class Contrition extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    statTracker: StatTracker,
    penance: Penance, // we need this to add `penanceBoltNumber` to the damage and heal events
  };

  healing = 0;
  damagePenalty = 0;
  penanceBoltEstimation;

  static calculateOverhealing(estimateHealing, healing, overhealing = 0) {
    if (estimateHealing - healing < 0) {
      return 0;
    }

    return estimateHealing - healing;
  }

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasTalent(
      SPELLS.CONTRITION_TALENT.id
    );
    this.penanceBoltEstimation = OffensivePenanceBoltEstimation(
      this.statTracker
    );
  }

  /**
   * Theory behind this is as follows
   * By casting a contrition penance, you lose an offensive penance worth of healing
   * To hone in on the true value of contrition, we estimate the healing of an offensive
   * penance hit, and subtract that from the contrition amount.
   *
   * We keep the penance heal as that is a true gain from choosing a contrition
   * penance over a regular offensive one.
   */
  on_byPlayer_heal(event) {
    if (
      event.ability.guid !== SPELLS.CONTRITION_HEAL.id &&
      event.ability.guid !== SPELLS.PENANCE_HEAL.id
    ) {
      return;
    }

    // Add the healing to our count
    this.healing += event.amount;

    // Get an estimated amount of damage and healing for a bolt
    const { boltDamage, boltHealing } = this.penanceBoltEstimation();

    // Calculate the difference between contrition and an offensive penance
    if (event.ability.guid === SPELLS.CONTRITION_HEAL.id) {
      const estimatedBoltHealing = boltHealing * event.hitType;
      const estimatedOverhealing = Contrition.calculateOverhealing(
        estimatedBoltHealing,
        event.amount,
        event.overheal
      );

      this.healing -= estimatedBoltHealing - estimatedOverhealing;
    }

    // Calculate (if applicable), the damage penalty per bolt of friendly penance
    if (event.ability.guid === SPELLS.PENANCE_HEAL.id) {
      this.damagePenalty += boltDamage;
    }
  }

  statistic() {
    const healing = this.healing || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CONTRITION_TALENT.id} />}
        value={`${formatNumber(healing / this.owner.fightDuration * 1000)} HPS`}
        label={
          <dfn
            data-tip={`The effective healing contributed by Contrition (${formatPercentage(
              this.owner.getPercentageOfTotalHealingDone(healing)
            )}% of total healing done). You lost roughly ${formatNumber(
              this.damagePenalty / this.owner.fightDuration * 1000
            )} DPS, or ${formatPercentage(
              this.owner.getPercentageOfTotalDamageDone(this.damagePenalty)
            )}% more damage.`}
          >
            Contrition healing
          </dfn>
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Contrition;
