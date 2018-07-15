import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

const GG_DURATION = 10000;
const debug = false;

class GalacticGuardian extends Analyzer {
  GGProcsTotal = 0;
  lastGGProcTime = 0;
  consumedGGProc = 0;
  overwrittenGGProc = 0;
  nonGGMoonFire = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GALACTIC_GUARDIAN_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GALACTIC_GUARDIAN.id === spellId) {
      this.lastGGProcTime = event.timestamp;
      debug && console.log('Galactic Guardian applied');
      this.GGProcsTotal += 1;
    }
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (SPELLS.GALACTIC_GUARDIAN.id === spellId) {
      // Captured Overwritten GG Buffs for use in wasted buff calculations
      this.lastGGProcTime = event.timestamp;
      debug && console.log('Galactic Guardian Overwritten');
      this.GGProcsTotal += 1;
      this.overwrittenGGProc += 1;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.MOONFIRE.id !== spellId) {
      return;
    }
    if (this.lastGGProcTime !== event.timestamp) {
      if (this.lastGGProcTime === null) {
        this.nonGGMoonFire += 1;
        return;
      }
      const GGTimeframe = this.lastGGProcTime + GG_DURATION;
      if (event.timestamp > GGTimeframe) {
        this.nonGGMoonFire += 1;
      } else {
        this.consumedGGProc += 1;
        debug && console.log(`Galactic Guardian Proc Consumed / Timestamp: ${event.timestamp}`);
        this.lastGGProcTime = null;
      }
    }
  }

  suggestions(when) {
    const unusedGGProcs = 1 - (this.consumedGGProc / this.GGProcsTotal);
    when(unusedGGProcs).isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You wasted {formatPercentage(unusedGGProcs)}% of your <SpellLink id={SPELLS.GALACTIC_GUARDIAN.id} /> procs. Try to use the procs as soon as you get them so they are not overwritten.</span>)
          .icon(SPELLS.GALACTIC_GUARDIAN.icon)
          .actual(`${formatPercentage(unusedGGProcs)}% unused`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.3);
      });
  }

  statistic() {
    const unusedGGProcs = 1 - (this.consumedGGProc / this.GGProcsTotal);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GALACTIC_GUARDIAN.id} />}
        value={`${formatPercentage(unusedGGProcs)}%`}
        label="Unused Galactic Guardian"
        tooltip={`You got total <b>${this.GGProcsTotal}</b> galactic guardian procs and <b>used ${this.consumedGGProc}</b> of them.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default GalacticGuardian;
