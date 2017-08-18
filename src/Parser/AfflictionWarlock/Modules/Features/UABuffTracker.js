import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const debug = true;
const UAspellIds = [SPELLS.UNSTABLE_AFFLICTION_DEBUFF_1.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_2.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_3.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_4.id,
  SPELLS.UNSTABLE_AFFLICTION_DEBUFF_5.id,
];

class UABuffTracker extends Module {

  static dependencies = {
    enemies: Enemies,
  };

  totalTicks = 0;
  unbuffedTicks = 0;
  ticksBuffedByReap = 0;
  ticksBuffedByDrain = 0;
  ticksBuffedByBoth = 0;
  hasMG = false;

  on_initialized() {
    if(!this.owner.error)
      this.hasMG = this.owner.selectedCombatant.hasTalent(SPELLS.MALEFIC_GRASP_TALENT.id);
  }
  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if(UAspellIds.indexOf(spellId) === -1)
      return;
    const target = this.enemies.getEntity(event);
    this.totalTicks++;
    const buffedByReap = this.owner.selectedCombatant.hasBuff(SPELLS.DEADWIND_HARVESTER.id, event.timestamp);
    const buffedByDrain = target.hasBuff(SPELLS.DRAIN_SOUL.id, event.timestamp);

    if(this.hasMG) {
      if(buffedByReap && buffedByDrain)
        this.ticksBuffedByBoth++;
      else if(buffedByReap)
        this.ticksBuffedByReap++;
      else if(buffedByDrain)
        this.ticksBuffedByDrain++;
      else
        this.unbuffedTicks++;
    }
    else {
      if(buffedByReap)
        this.ticksBuffedByReap++;
      else
        this.unbuffedTicks++;
    }
  }

  on_finished() {
    console.log("Total ticks:", this.totalTicks);
    console.log("Buffed by both:", this.ticksBuffedByBoth);
    console.log("Buffed by drain:", this.ticksBuffedByDrain);
    console.log("Buffed by reap:", this.ticksBuffedByReap);
    console.log("Buffed by at least one ", (this.totalTicks - this.unbuffedTicks));
    console.log("Unbuffed ticks:", this.unbuffedTicks);
  }
  suggestions(when){
    const buffPercentage = this.unbuffedTicks / this.totalTicks;
    //actual = value in when()
    //recommended = value in isLessThan()
    when(buffPercentage).isGreaterThan(0.15)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your Unstable Afflictions could be buffed more. Unstable Affliction is your main source of damage so keeping it buffed as much as possible with Reap Souls and Drain Soul (if using the Malefic Grasp talent) is very important.')
          .icon(SPELLS.UNSTABLE_AFFLICTION_CAST.icon)
          .actual(`${formatPercentage(actual)}% unbuffed Unstable Affliction ticks.`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.1);
      });
  }
  statistic() {
    let buffPercentage = 0;
    if(this.hasMG)
      buffPercentage = 1 - (this.unbuffedTicks / this.totalTicks);
    else
      buffPercentage = this.ticksBuffedByReap / this.totalTicks;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UNSTABLE_AFFLICTION_CAST.id} />}
        value={`${formatPercentage(buffPercentage)} %`}
        label={(<dfn data-tip={`Your Unstable Afflictions ticked ${this.totalTicks} times in total. Out of that amount:
          <ul>
          ${this.hasMG && this.ticksBuffedByBoth > 0 ? `
            <li>${this.ticksBuffedByBoth} ticks were buffed by both Reap Souls and Drain Soul (${formatPercentage(this.ticksBuffedByBoth/this.totalTicks)}%)</li>
          `: ""}

          ${this.ticksBuffedByReap > 0 ? `
            <li>${this.ticksBuffedByReap} ticks were buffed by Reap Souls (${formatPercentage(this.ticksBuffedByReap/this.totalTicks)}%)</li>
          `: ""}

          ${this.hasMG && this.ticksBuffedByDrain > 0 ? `
            <li>${this.ticksBuffedByDrain} ticks were buffed by Drain Soul (${formatPercentage(this.ticksBuffedByDrain/this.totalTicks)}%)</li>
          `: ""}

          ${this.unbuffedTicks > 0 ? `
            <li>${this.unbuffedTicks} ticks were unbuffed (${formatPercentage(this.unbuffedTicks/this.totalTicks)}%). You should try to minimize this amount as much as possible.</li>
          `: ""}
          </ul>
        `}>
          UA buffed ticks
        </dfn>)}
      />
    );
  }
}

export default UABuffTracker;
