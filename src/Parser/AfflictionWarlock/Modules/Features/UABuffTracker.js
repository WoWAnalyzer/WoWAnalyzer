import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import { UNSTABLE_AFFLICTION_DEBUFF_IDS } from '../../Constants';

class UABuffTracker extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  totalTicks = 0;
  unbuffedTicks = 0;
  ticksBuffedByReap = 0;
  ticksBuffedByDrain = 0;
  ticksBuffedByHaunt = 0;
  ticksBuffedByBoth = 0;
  hasMG = false;
  hasHaunt = false;

  on_initialized() {
    this.hasMG = this.owner.selectedCombatant.hasTalent(SPELLS.MALEFIC_GRASP_TALENT.id);
    this.hasHaunt = this.owner.selectedCombatant.hasTalent(SPELLS.HAUNT_TALENT.id);
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (UNSTABLE_AFFLICTION_DEBUFF_IDS.indexOf(spellId) === -1) {
      return;
    }
    const target = this.enemies.getEntity(event);
    this.totalTicks++;
    const buffedByReap = this.owner.selectedCombatant.hasBuff(SPELLS.DEADWIND_HARVESTER.id, event.timestamp);
    const buffedByDrain = target.hasBuff(SPELLS.DRAIN_SOUL.id, event.timestamp);
    const buffedByHaunt = target.hasBuff(SPELLS.HAUNT.id, event.timestamp);

    if (this.hasMG) {
      if (buffedByReap && buffedByDrain) {
        this.ticksBuffedByBoth++;
      }
      else if (buffedByReap) {
        this.ticksBuffedByReap++;
      }
      else if (buffedByDrain) {
        this.ticksBuffedByDrain++;
      }
      else {
        this.unbuffedTicks++;
      }
    }
    else if (this.hasHaunt) {
      if (buffedByReap && buffedByHaunt) {
        this.ticksBuffedByBoth++;
      }
      else if (buffedByReap) {
        this.ticksBuffedByReap++;
      }
      else if (buffedByHaunt) {
        this.ticksBuffedByHaunt++;
      }
      else {
        this.unbuffedTicks++;
      }
    }
    else {
      if (buffedByReap) {
        this.ticksBuffedByReap++;
      }
      else {
        this.unbuffedTicks++;
      }
    }
  }

  suggestions(when) {
    const unbuffedTicksPercentage = this.unbuffedTicks / this.totalTicks;
    when(unbuffedTicksPercentage).isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your Unstable Afflictions could be buffed more. Unstable Affliction is your main source of damage so keeping it buffed as much as possible with Reap Souls, Drain Soul (if using the Malefic Grasp talent) or Haunt (if using the talent) is very important.')
          .icon(SPELLS.UNSTABLE_AFFLICTION_CAST.icon)
          .actual(`${formatPercentage(actual)}% unbuffed Unstable Affliction ticks.`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.1);
      });
  }

  statistic() {
    const buffedTicksPercentage = 1 - (this.unbuffedTicks / this.totalTicks);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} />}
        value={`${formatPercentage(buffedTicksPercentage)} %`}
        label='UA buffed ticks'
        tooltip={`Your Unstable Afflictions ticked ${this.totalTicks} times in total. Out of that amount:
          <ul>
          ${this.hasMG && this.ticksBuffedByBoth > 0 ? `
            <li>${this.ticksBuffedByBoth} ticks were buffed by both Reap Souls and Drain Soul (${formatPercentage(this.ticksBuffedByBoth/this.totalTicks)}%)</li>
          `: ""}
          ${this.hasHaunt && this.ticksBuffedByBoth > 0 ? `
            <li>${this.ticksBuffedByBoth} ticks were buffed by both Reap Souls and Haunt (${formatPercentage(this.ticksBuffedByBoth/this.totalTicks)}%)</li>
          `: ""}

          ${this.ticksBuffedByReap > 0 ? `
            <li>${this.ticksBuffedByReap} ticks were buffed by Reap Souls only (${formatPercentage(this.ticksBuffedByReap/this.totalTicks)}%)</li>
          `: ""}

          ${this.hasMG && this.ticksBuffedByDrain > 0 ? `
            <li>${this.ticksBuffedByDrain} ticks were buffed by Drain Soul only (${formatPercentage(this.ticksBuffedByDrain/this.totalTicks)}%)</li>
          `: ""}

          ${this.hasHaunt && this.ticksBuffedByHaunt > 0 ? `
            <li>${this.ticksBuffedByHaunt} ticks were buffed by Haunt only (${formatPercentage(this.ticksBuffedByHaunt/this.totalTicks)}%)</li>
          `: ""}

          ${this.unbuffedTicks > 0 ? `
            <li>${this.unbuffedTicks} ticks were unbuffed (${formatPercentage(this.unbuffedTicks/this.totalTicks)}%). You should try to minimize this amount as much as possible.</li>
          `: ""}
          </ul>
        `}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default UABuffTracker;
