import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Module from 'Parser/Core/Module';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;
const PHYSICAL_DAMAGE = 1;

class Stagger extends Module {

  totalPhysicalStaggered = 0;
  totalMagicalStaggered = 0;
  totalStaggerTaken = 0;
  on_toPlayer_absorbed(event) {
    if (event.ability.guid === SPELLS.STAGGER.id) {
      if (event.extraAbility.guid === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id) {
        return;
      }
      if (event.extraAbility.type === PHYSICAL_DAMAGE) {
        this.totalPhysicalStaggered += event.amount;
      }
      else {
        this.totalMagicalStaggered += event.amount;
      }
    }
  }

  on_toPlayer_damage(event) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      this.totalStaggerTaken += event.amount;
    }
  }

  on_finished() {
    if (debug) {
      console.log('Total physical staggered: ' + formatNumber(this.totalPhysicalStaggered));
      console.log('Total magical staggered: ' + formatNumber(this.totalMagicalStaggered));
      console.log('Total taken: ' + formatNumber(this.totalStaggerTaken));
      console.log('Damage avoided: ' + formatNumber(this.totalPhysicalStaggered + this.totalMagicalStaggered - this.totalStaggerTaken));
    }
  }

  statistic() {
    const totalStaggered = this.totalPhysicalStaggered + this.totalMagicalStaggered;
    const damageAvoided = totalStaggered - this.totalStaggerTaken;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONSKIN_BREW.id} />}
        value={`${formatNumber(totalStaggered)} `}
        label='Damage staggered'
        tooltip={`Incoming damage staggered:
          <ul>
            <li>Total physical damage staggered: ${formatThousands(this.totalPhysicalStaggered)}</li>
            <li>Total magical damage staggered: ${formatThousands(this.totalMagicalStaggered)}</li>
          </ul>
          Stagger dot:
          <ul>
            <li>Total staggered damage taken: ${formatThousands(this.totalStaggerTaken)} (${formatPercentage(this.totalStaggerTaken/totalStaggered)}% of total staggered)</li>
            <li>Total staggered damage purified: ${formatThousands(damageAvoided)} (${formatPercentage(damageAvoided/totalStaggered)}% of total staggered)</li>
          </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Stagger;
