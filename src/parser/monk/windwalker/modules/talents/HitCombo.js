import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import UptimeIcon from 'interface/icons/Uptime';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';
import { formatNumber, formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText/index';
import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from 'parser/monk/windwalker/constants';

const MOD_PER_STACK = 0.01;

class HitCombo extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.HIT_COMBO_TALENT.id);
    if (this.active) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES), this.onAffectedDamage);
    }
  }
  totalDamage = 0;

  onAffectedDamage(event) {
    const buffInfo = this.selectedCombatant.getBuff(SPELLS.HIT_COMBO_BUFF.id);
    console.log('Heoyyroaoao');
    if (!buffInfo) {
      return;
    }
    const mod = buffInfo.stacks * MOD_PER_STACK;
    const increase = calculateEffectiveDamage(event, mod);
    this.totalDamage += increase;
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.HIT_COMBO_BUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.90,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You let your <SpellLink id={SPELLS.HIT_COMBO_TALENT.id} /> buff drop by casting a spell twice in a row. Dropping this buff is a large DPS decrease so be mindful of the spells being cast.</span>)
          .icon(SPELLS.HIT_COMBO_TALENT.icon)
          .actual(`${formatPercentage(actual)} % uptime`)
          .recommended(`>${formatPercentage(recommended)} % is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(90)}
        size="flexible"
        tooltip={`Total damage increase: ${formatNumber(this.totalDamage)}`}
      >
        <BoringSpellValueText spell={SPELLS.HIT_COMBO_TALENT}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>Buff uptime</small><br />
          {this.owner.formatItemDamageDone(this.totalDamage)}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HitCombo;
