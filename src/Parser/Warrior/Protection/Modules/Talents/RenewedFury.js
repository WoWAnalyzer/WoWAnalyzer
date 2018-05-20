import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';
import { formatNumber, formatPercentage } from 'common/format';

const RENEWED_FURY_DAMAGE_INCREASE = 0.1;

class RenewedFury extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.RENEWED_FURY_TALENT.id);
  }

  get uptime() {
    return this.combatants.getBuffUptime(SPELLS.RENEWED_FURY_TALENT_BUFF.id) / this.owner.fightDuration;
  }

  on_byPlayer_damage(event) {
    if (!this.combatants.selected.hasBuff(SPELLS.RENEWED_FURY_TALENT_BUFF.id)) {
      return;
    }
    
    this.bonusDmg += calculateEffectiveDamage(event, RENEWED_FURY_DAMAGE_INCREASE);
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: .95,
        average: .85,
        major: .75,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<React.Fragment>Maximize your <SpellLink id={SPELLS.RENEWED_FURY_TALENT.id} /> uptime by weaving <SpellLink id={SPELLS.IGNORE_PAIN.id} /> into your rotation instead of casting it multiple times in a short timeframe.</React.Fragment>)
            .icon(SPELLS.RENEWED_FURY_TALENT.icon)
            .actual(`${formatPercentage(actual)}% uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RENEWED_FURY_TALENT.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label={`Uptime`}
        tooltip={`${formatNumber(this.bonusDmg)} damage contributed
        `}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default RenewedFury;
