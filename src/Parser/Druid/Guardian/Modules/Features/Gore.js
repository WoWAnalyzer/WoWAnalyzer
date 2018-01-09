// Based on Clearcasting Implementation done by @Blazyb
import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SPELLS from 'common/SPELLS';

const GORE_DURATION = 10000;
const debug = false;

class Gore extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  totalProcs = 0;
  lastGoreProcTime = 0;
  consumedGoreProc = 0;
  overwrittenGoreProc = 0;
  nonGoreMangle = 0;

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GORE_BEAR.id === spellId) {
      if (this.spellUsable.isOnCooldown(SPELLS.MANGLE_BEAR.id)) {
        this.spellUsable.endCooldown(SPELLS.MANGLE_BEAR.id);
      }
      this.lastGoreProcTime = event.timestamp;
      debug && console.log('Gore applied');
      this.totalProcs += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GORE_BEAR.id === spellId) {
      // Captured Overwritten Gore Buffs for use in wasted buff calculations
      if (this.spellUsable.isOnCooldown(SPELLS.MANGLE_BEAR.id)) {
        this.spellUsable.endCooldown(SPELLS.MANGLE_BEAR.id);
      }
      this.lastGoreProcTime = event.timestamp;
      debug && console.log('Gore Overwritten');
      this.totalProcs += 1;
      this.overwrittenGoreProc += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.MANGLE_BEAR.id !== spellId) {
      return;
    }
    if (this.lastGoreProcTime !== event.timestamp) {
      if (this.lastGoreProcTime === 0) {
        this.nonGoreMangle += 1;
        return;
      }
      const goreTimeframe = this.lastGoreProcTime + GORE_DURATION;
      if (event.timestamp > goreTimeframe) {
        this.nonGoreMangle += 1;
      } else {
        this.consumedGoreProc += 1;
        debug && console.log(`Gore Proc Consumed / Timestamp: ${event.timestamp}`);
        this.lastGoreProcTime = 0;
      }
    }
  }

  suggestions(when) {
    const unusedGoreProcs = 1 - (this.consumedGoreProc / this.totalProcs);

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
    const unusedGoreProcs = 1 - (this.consumedGoreProc / this.totalProcs);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GORE_BEAR.id} />}
        value={`${formatPercentage(unusedGoreProcs)}%`}
        label="Unused Gore Procs"
        tooltip={`You got total <b>${this.totalProcs}</b> gore procs and <b>used ${this.consumedGoreProc}</b> of them.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Gore;
