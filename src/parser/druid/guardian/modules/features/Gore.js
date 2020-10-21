// Based on Clearcasting Implementation done by @Blazyb
import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

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

  constructor(options){
    super(options);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GORE_BEAR), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GORE_BEAR), this.onRefreshBuff);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MANGLE_BEAR), this.onCast);
  }

  onApplyBuff(event) {
    if (this.spellUsable.isOnCooldown(SPELLS.MANGLE_BEAR.id)) {
      this.spellUsable.endCooldown(SPELLS.MANGLE_BEAR.id);
    }
    this.lastGoreProcTime = event.timestamp;
    debug && console.log('Gore applied');
    this.totalProcs += 1;
  }

  onRefreshBuff(event) {
    // Captured Overwritten Gore Buffs for use in wasted buff calculations
    if (this.spellUsable.isOnCooldown(SPELLS.MANGLE_BEAR.id)) {
      this.spellUsable.endCooldown(SPELLS.MANGLE_BEAR.id);
    }
    this.lastGoreProcTime = event.timestamp;
    debug && console.log('Gore Overwritten');
    this.totalProcs += 1;
    this.overwrittenGoreProc += 1;
  }

  onCast(event) {
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
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You wasted {formatPercentage(unusedGoreProcs)}% of your <SpellLink id={SPELLS.GORE_BEAR.id} /> procs. Try to use the procs as soon as you get them so they are not overwritten.</span>)
          .icon(SPELLS.GORE_BEAR.icon)
          .actual(i18n._(t('druid.guardian.suggestions.gore.unused')`${formatPercentage(unusedGoreProcs)}% unused`))
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.3));
  }

  statistic() {
    const unusedGoreProcs = 1 - (this.consumedGoreProc / this.totalProcs);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GORE_BEAR.id} />}
        value={`${formatPercentage(unusedGoreProcs)}%`}
        label="Unused Gore Procs"
        tooltip={<>You got total <strong>{this.totalProcs}</strong> gore procs and <strong>used {this.consumedGoreProc}</strong> of them.</>}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Gore;
