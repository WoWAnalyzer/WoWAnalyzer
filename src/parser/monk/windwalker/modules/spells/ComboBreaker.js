import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import Analyzer from 'parser/core/Analyzer';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

const CB_DURATION = 15000;
const debug = false;

class ComboBreaker extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  CBProcsTotal = 0;
  lastCBProcTime = null;
  consumedCBProc = 0;
  overwrittenCBProc = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.COMBO_BREAKER_BUFF.id === spellId) {
      this.lastCBProcTime = event.timestamp;
      debug && console.log('CB Proc Applied');
      this.CBProcsTotal += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.COMBO_BREAKER_BUFF.id === spellId) {
      this.lastCBProcTime = event.timestamp;
      debug && console.log('CB Proc Overwritten');
      this.CBProcsTotal += 1;
      this.overwrittenCBProc += 1;
    }
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.BLACKOUT_KICK.id !== spellId) {
      return;
    }
    if (this.lastCBProcTime !== event.timestamp) {
     if (this.lastCBProcTime === null) {
        return;
      }
      const cbTimeframe = this.lastCBProcTime + CB_DURATION;
      if (event.timestamp <= cbTimeframe) {
       this.consumedCBProc += 1;
        debug && console.log(`CB Proc Consumed / Timestamp: ${event.timestamp}`);
       this.lastCBProcTime = null;
      }
    }
  }
  get suggestionThresholds() {
    const usedCBprocs = this.consumedCBProc / this.CBProcsTotal;
    return {
      actual: usedCBprocs,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const unusedCBprocs = 1 - (this.consumedCBProc / this.CBProcsTotal);
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs should be used before you tiger palm again so they are not overwritten. While some will be overwritten due to higher priority of getting Chi for spenders, wasting <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} /> procs is not optimal.</span>)
          .icon(SPELLS.COMBO_BREAKER_BUFF.icon)
          .actual(`${formatPercentage(unusedCBprocs)}% used Combo Breaker procs`)
          .recommended(`>${formatPercentage(recommended)}% used Combo Breaker Procs is recommended`);
    });
  }
  
  statistic() {
    const usedCBProcs = this.consumedCBProc / this.CBProcsTotal;
    const averageCBProcs = this.abilityTracker.getAbility(SPELLS.TIGER_PALM.id).casts * (this.selectedCombatant.hasTrait(SPELLS.PRESSURE_POINT.id) ? 0.1 : 0.08);
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.COMBO_BREAKER_BUFF.id} />}
        value={`${formatPercentage(usedCBProcs)}%`}
        label="Combo Breaker Procs Used"
        tooltip={`You got a total of <b>${this.CBProcsTotal} Combo Breaker procs</b> and <b>used ${this.consumedCBProc}</b> of them. Average number of procs from your Tiger Palms this fight is <b>${averageCBProcs.toFixed(2)}</b>, and you got <b>${this.CBProcsTotal}</b>.`}
      />
   );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default ComboBreaker;
