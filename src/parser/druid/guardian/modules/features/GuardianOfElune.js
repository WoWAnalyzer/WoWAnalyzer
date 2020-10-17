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

const GOE_DURATION = 15000;
const debug = false;

class GuardianOfElune extends Analyzer {
  GoEProcsTotal = 0;
  lastGoEProcTime = 0;
  consumedGoEProc = 0;
  overwrittenGoEProc = 0;
  nonGoEIronFur = 0;
  GoEIronFur = 0;
  nonGoEFRegen = 0;
  GoEFRegen = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.GUARDIAN_OF_ELUNE_TALENT.id);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_OF_ELUNE), this.onApplyBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GUARDIAN_OF_ELUNE), this.onRefreshBuff);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.IRONFUR), this.onCastIronfur);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FRENZIED_REGENERATION), this.onCastFrenziedRegen);
  }

  onApplyBuff(event) {
    this.lastGoEProcTime = event.timestamp;
    debug && console.log('Guardian of Elune applied');
    this.GoEProcsTotal += 1;
  }

  onRefreshBuff(event) {
    // Captured Overwritten GoE Buffs for use in wasted buff calculations
    this.lastGoEProcTime = event.timestamp;
    debug && console.log('Guardian of Elune Overwritten');
    this.GoEProcsTotal += 1;
    this.overwrittenGoEProc += 1;
  }

  onCastIronfur(event){
    if (this.lastGoEProcTime !== event.timestamp) {
      if (this.lastGoEProcTime === null) {
        this.nonGoEIronFur += 1;
        return;
      }
      const GoETimeframe = this.lastGoEProcTime + GOE_DURATION;
      if (event.timestamp > GoETimeframe) {
        this.nonGoEIronFur += 1;
      } else {
        this.consumedGoEProc += 1;
        this.GoEIronFur += 1;
        debug && console.log(`Guardian of Elune Proc Consumed / Timestamp: ${event.timestamp}`);
        this.lastGoEProcTime = null;
      }
    }
  }

  onCastFrenziedRegen(event){
    if (this.lastGoEProcTime !== event.timestamp) {
      if (this.lastGoEProcTime === null) {
        this.nonGoEFRegen += 1;
        return;
      }
      const GoETimeframe = this.lastGoEProcTime + GOE_DURATION;
      if (event.timestamp > GoETimeframe) {
        this.nonGoEFRegen += 1;
      } else {
        this.consumedGoEProc += 1;
        this.GoEFRegen += 1;
        debug && console.log(`Guardian of Elune Proc Consumed / Timestamp: ${event.timestamp}`);
        this.lastGoEProcTime = null;
      }
    }
  }

  suggestions(when) {
    const unusedGoEProcs = 1 - (this.consumedGoEProc / this.GoEProcsTotal);

    when(unusedGoEProcs).isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>You wasted {formatPercentage(unusedGoEProcs)}% of your <SpellLink id={SPELLS.GUARDIAN_OF_ELUNE.id} /> procs. Try to use the procs as soon as you get them so they are not overwritten.</span>)
          .icon(SPELLS.GUARDIAN_OF_ELUNE.icon)
          .actual(i18n._(t('druid.guardian.suggestions.guardianOfElune.unused')`${formatPercentage(unusedGoEProcs)}% unused`))
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.3));
  }

  statistic() {
    const unusedGoEProcs = 1 - (this.consumedGoEProc / this.GoEProcsTotal);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GUARDIAN_OF_ELUNE.id} />}
        value={`${formatPercentage(unusedGoEProcs)}%`}
        label="Unused Guardian of Elune"
        tooltip={<>You got total <strong>{this.GoEProcsTotal}</strong> guardian of elune procs and <strong>used {this.consumedGoEProc}</strong> of them.</>}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default GuardianOfElune;
