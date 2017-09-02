import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Module from 'Parser/Core/Module';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = false;
const PHYSICAL_DAMAGE = 1;
const BASE_STAGGER_TICKS = 20;
const JEWEL_OF_THE_LOST_ABBEY_TICKS = 6;
const STAGGER_TICK_FREQUENCY = 500;

class Stagger extends Module {

  totalPhysicalStaggered = 0;
  totalMagicalStaggered = 0;
  totalStaggerTaken = 0;
  staggerLength = BASE_STAGGER_TICKS;
  lastDamageEventNotStagger = 0;
  lastDamageEventWasStagger = 0;
  lastStaggerValue = 0;
  staggerMissingFromFight = 0;

  on_initialized() {
    if (this.owner.selectedCombatant.getFinger(ITEMS.JEWEL_OF_THE_LOST_ABBEY.id)) {
      debug && console.log('Has stagger ring');
      this.staggerLength += JEWEL_OF_THE_LOST_ABBEY_TICKS;
    }
  }

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
      this.totalStaggerTaken += event.amount + (event.absorbed || 0);
      this.lastDamageEventWasStagger = event.timestamp;
      this.lastStaggerValue = event.amount + (event.absorbed || 0);
    }
    else {
      this.lastDamageEventNotStagger = event.timestamp;
    }
  }

  on_finished() {
    // End of fight correction
    const fightEnd = this.owner.fight.end_time;
    if (fightEnd - this.lastDamageEventWasStagger < STAGGER_TICK_FREQUENCY * 2) {
      const numberOfTicksTaken = Math.ceil((this.lastDamageEventWasStagger - this.lastDamageEventNotStagger) / STAGGER_TICK_FREQUENCY);
      const staggerTicksLeft = this.staggerLength - (numberOfTicksTaken > 0 ? numberOfTicksTaken : 0);
      this.staggerMissingFromFight = this.lastStaggerValue * Math.max(staggerTicksLeft, 0);
    }
    if (debug) {
      console.log('Total physical staggered: ' + formatNumber(this.totalPhysicalStaggered));
      console.log('Total magical staggered: ' + formatNumber(this.totalMagicalStaggered));
      console.log('Total taken: ' + formatNumber(this.totalStaggerTaken));
      console.log('Stagger taken after fight: ' + formatNumber(this.staggerMissingFromFight));
      console.log('Damage avoided: ' + formatNumber(this.totalPhysicalStaggered + this.totalMagicalStaggered - this.totalStaggerTaken));
    }
  }

  statistic() {
    const totalStaggered = this.totalPhysicalStaggered + this.totalMagicalStaggered;
    const damageAvoided = totalStaggered - this.totalStaggerTaken - this.staggerMissingFromFight;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONSKIN_BREW.id} />}
        value={`${formatNumber(totalStaggered)} `}
        label='Damage staggered'
        tooltip={`Incoming damage added to stagger:
          <ul>
            <li>Total physical damage added to stagger: ${formatThousands(this.totalPhysicalStaggered)}</li>
            <li>Total magical damage added to stagger: ${formatThousands(this.totalMagicalStaggered)}</li>
          </ul>
          Damage taken from stagger:
          <ul>
            <li>Total damage from stagger dot: ${formatThousands(this.totalStaggerTaken)} (${formatPercentage(this.totalStaggerTaken/totalStaggered)}% of total staggered)</li>
            <li>Total damage removed from stagger dot before damaging you: ${formatThousands(damageAvoided)} (${formatPercentage(damageAvoided/totalStaggered)}% of total staggered)</li>
          </ul>
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(30);
}

export default Stagger;
