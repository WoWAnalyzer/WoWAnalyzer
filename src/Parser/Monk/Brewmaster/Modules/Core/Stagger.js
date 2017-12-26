import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import StaggerFabricator, { EVENT_STAGGER_POOL_UPDATE } from './StaggerFabricator';

const debug = false;
const PHYSICAL_DAMAGE = 1;

class Stagger extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    fab: StaggerFabricator,
  }

  totalPhysicalStaggered = 0;
  totalMagicalStaggered = 0;
  totalStaggerTaken = 0;
  staggerMissingFromFight = 0;

  on_stagger_pool_update(event) {
    if(event.amount > 0) {
      // damage added to stagger pool
      if(event.extraAbility.type === PHYSICAL_DAMAGE) {
        this.totalPhysicalStaggered += event.amount;
      } else {
        this.totalMagicalStaggered += event.amount;
      }
    } else {
      this.totalStaggerTaken += -event.amount;
    }
  }

  on_stagger_pool_end(event) {
    this.staggerMissingFromFight = event.amount;
  }

  on_finished() {
    if (debug) {
      console.log(`Total physical staggered: ${formatNumber(this.totalPhysicalStaggered)}`);
      console.log(`Total magical staggered: ${formatNumber(this.totalMagicalStaggered)}`);
      console.log(`Total taken: ${formatNumber(this.totalStaggerTaken)}`);
      console.log(`Stagger taken after fight: ${formatNumber(this.staggerMissingFromFight)}`);
      console.log(`Damage avoided: ${formatNumber(this.totalPhysicalStaggered + this.totalMagicalStaggered - this.totalStaggerTaken)}`);
    }
  }

  statistic() {
    const totalStaggered = this.totalPhysicalStaggered + this.totalMagicalStaggered;
    const damageAvoided = totalStaggered - this.totalStaggerTaken - this.staggerMissingFromFight;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONSKIN_BREW.id} />}
        value={`${formatNumber(totalStaggered)} `}
        label="Damage staggered"
        tooltip={`Incoming damage added to stagger:
          <ul>
            <li>Total physical damage added to stagger: ${formatThousands(this.totalPhysicalStaggered)}</li>
            <li>Total magical damage added to stagger: ${formatThousands(this.totalMagicalStaggered)}</li>
          </ul>
          Damage taken from stagger:
          <ul>
            <li>Total damage from stagger dot: ${formatThousands(this.totalStaggerTaken)} (${formatPercentage(this.totalStaggerTaken / totalStaggered)}% of total staggered)</li>
            <li>Total damage removed from stagger dot before damaging you: ${formatThousands(damageAvoided)} (${formatPercentage(damageAvoided / totalStaggered)}% of total staggered)</li>
          </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Stagger;
