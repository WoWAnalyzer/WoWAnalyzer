import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import StatTracker from 'parser/shared/modules/StatTracker';
import { TooltipElement } from 'common/Tooltip';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';

import Penance from './Penance';
import { calculateOverhealing, OffensivePenanceBoltEstimation } from '../../SpellCalculations';

class Contrition extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
    penance: Penance, // we need this to add `penanceBoltNumber` to the damage and heal events
  };
  protected statTracker!: StatTracker;
  protected penance!: Penance;

  healing = 0;
  damagePenalty = 0;
  penanceBoltEstimation: any;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(
      SPELLS.CONTRITION_TALENT.id,
    );
    this.penanceBoltEstimation = OffensivePenanceBoltEstimation(
      this.statTracker,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell([SPELLS.CONTRITION_HEAL, SPELLS.PENANCE_HEAL]), this.onHeal);
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
  onHeal(event: HealEvent) {
    // Add the healing to our count
    this.healing += event.amount;

    // Get an estimated amount of damage and healing for a bolt
    const { boltDamage, boltHealing } = this.penanceBoltEstimation();

    // Calculate the difference between contrition and an offensive penance
    if (event.ability.guid === SPELLS.CONTRITION_HEAL.id) {
      const estimatedBoltHealing = boltHealing * event.hitType;
      const estimatedOverhealing = calculateOverhealing(
        estimatedBoltHealing,
        event.amount,
        event.overheal,
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
        label={(
          <TooltipElement
            content={
              `The effective healing contributed by Contrition (${formatPercentage(this.owner.getPercentageOfTotalHealingDone(healing))}% of total healing done).
              You lost roughly ${formatNumber(this.damagePenalty / this.owner.fightDuration * 1000)} DPS, or ${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damagePenalty))}% more damage.`
            }
          >
            Contrition healing
          </TooltipElement>
        )}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Contrition;
