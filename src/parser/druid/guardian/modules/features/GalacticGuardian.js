import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

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
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GALACTIC_GUARDIAN), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GALACTIC_GUARDIAN), this.onRefreshBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MOONFIRE), this.onCast);
  }

  onApplyBuff(event) {
    this.lastGGProcTime = event.timestamp;
    debug && console.log('Galactic Guardian applied');
    this.GGProcsTotal += 1;
  }

  onRefreshBuff(event) {
    // Captured Overwritten GG Buffs for use in wasted buff calculations
    this.lastGGProcTime = event.timestamp;
    debug && console.log('Galactic Guardian Overwritten');
    this.GGProcsTotal += 1;
    this.overwrittenGGProc += 1;
  }

  onCast(event) {
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
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You wasted {formatPercentage(unusedGGProcs)}% of your <SpellLink id={SPELLS.GALACTIC_GUARDIAN.id} /> procs. Try to use the procs as soon as you get them so they are not overwritten.</span>)
          .icon(SPELLS.GALACTIC_GUARDIAN.icon)
          .actual(i18n._(t('druid.guardian.suggestions.galacticGuardian.unused')`${formatPercentage(unusedGGProcs)}% unused`))
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.3));
  }

  statistic() {
    const unusedGGProcs = 1 - (this.consumedGGProc / this.GGProcsTotal);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GALACTIC_GUARDIAN.id} />}
        value={`${formatPercentage(unusedGGProcs)}%`}
        label="Unused Galactic Guardian"
        tooltip={<>You got total <strong>{this.GGProcsTotal}</strong> galactic guardian procs and <strong>used {this.consumedGGProc}</strong> of them.</>}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default GalacticGuardian;
