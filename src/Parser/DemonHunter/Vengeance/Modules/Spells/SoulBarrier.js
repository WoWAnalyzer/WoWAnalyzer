import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS/index';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage, formatNumber } from 'common/format';
import DamageTracker from 'Parser/Core/Modules/AbilityTracker';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class SoulBarrier extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    damageTracker: DamageTracker,
    enemies: Enemies,
  };

  casts = 0;
  totalAbsorbed = 0;
  buffApplied = 0;
  buffRemoved = 0;
  buffLength = 0;
  avgBuffLength = 0;
  totalBuffLength = 0;


  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.SOUL_BARRIER_TALENT.id);
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.SOUL_BARRIER_TALENT.id) / this.owner.fightDuration;
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.SOUL_BARRIER_TALENT.id) {
      return;
    }
    this.casts += 1;
    this.buffApplied = event.timestamp;
  }

  on_toPlayer_absorbed(event) {
    if (event.ability.guid !== SPELLS.SOUL_BARRIER_TALENT.id) {
      return;
    }
    this.totalAbsorbed+= event.amount;
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.SOUL_BARRIER_TALENT.id) {
      return;
    }
    this.buffRemoved = event.timestamp;
    this.buffLength = this.buffRemoved - this.buffApplied;
    this.totalBuffLength += this.buffLength;
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: 1 - this.wastedCasts / this.casts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholdsEfficiency)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You casted {this.wastedCasts} <SpellLink id={SPELLS.SOUL_BARRIER_TALENT.id} /> with less than 5 charges causing a reduced absorb shield.</React.Fragment>)
          .icon(SPELLS.SOUL_BARRIER_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Soull Barrier`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const avgBuffLength = (this.totalBuffLength / this.casts) / 1000;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SOUL_BARRIER_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label='Soul Barrier Uptime'
        tooltip={`Average Buff Length: <strong>${formatNumber(avgBuffLength)} seconds</strong></br>
                  Total Damage Absorbed: <strong>${formatNumber(this.totalAbsorbed)}</strong></br>
                  Healing <strong>${this.owner.formatItemHealingDone(this.totalAbsorbed)}</strong></br>
                  Total Casts: <strong>${this.casts}</strong></br>`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default SoulBarrier;
