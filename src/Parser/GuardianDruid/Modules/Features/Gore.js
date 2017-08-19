// Based on Clearcasting Implementation done by @Blazyb
import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

const GORE_DURATION = 10000;
const debug = false;

class Gore extends Module {

  GoreProcsTotal = 0;
  lastGoreProcTime = 0;
  consumedGoreProc = 0;
  overwrittenGoreProc = 0;
  nonGoreMangle = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GORE_BEAR.id === spellId) {
      this.lastGoreProcTime = event.timestamp;
      debug && console.log('Gore applied');
      this.GoreProcsTotal++;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GORE_BEAR.id === spellId) {
      // Captured Overwritten Gore Buffs for use in wasted buff calculations
      this.lastGoreProcTime = event.timestamp;
      debug && console.log('Gore Overwritten');
      this.GoreProcsTotal++;
      this.overwrittenGoreProc++;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.MANGLE_BEAR.id !== spellId) {
      return;
    }
    if(this.lastGoreProcTime !== event.timestamp) {
      if(this.lastGoreProcTime === null) {
        this.nonGoreMangle++;
        return;
      }
      const goreTimeframe = this.lastGoreProcTime + GORE_DURATION;
      if(event.timestamp > goreTimeframe) {
        this.nonGoreMangle++;
      } else {
        this.consumedGoreProc++;
        debug && console.log('Gore Proc Consumed / Timestamp: ' + event.timestamp);
        this.lastGoreProcTime = null;
      }
    }
  }

  suggestions(when) {
    const unusedGoreProcs = 1 - (this.consumedGoreProc / this.GoreProcsTotal);
    
    when(unusedGoreProcs).isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You wasted {formatPercentage(unusedGoreProcs)}% of your <SpellLink id={SPELLS.GORE_BEAR.id} /> procs. Try to use the procs as soon as you get them so they are not overwritten.</span>)
          .icon(SPELLS.GORE_BEAR.icon)
          .actual(`${formatPercentage(unusedGoreProcs)}% unused`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.3);
      });
  }

  statistic() {
    const unusedGoreProcs = 1 - (this.consumedGoreProc / this.GoreProcsTotal);
   
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GORE_BEAR.id} />}
        value={`${formatPercentage(unusedGoreProcs)}%`}
        label='Unused Gore Procs'
        tooltip={`You got total <b>${this.GoreProcsTotal}</b> gore procs and <b>used ${this.consumedGoreProc}</b> of them.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Gore;
