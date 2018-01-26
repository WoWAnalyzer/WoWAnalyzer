import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import { formatNumber, formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import calculateEffectiveDamage from 'Parser/Core/calculateEffectiveDamage';

const ELT_DAMAGE_BONUS = 0.1;

class EmpoweredLifeTap extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  bonusDmg = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.EMPOWERED_LIFE_TAP_TALENT.id);
  }

  on_byPlayer_damage(event) {
    if (this.combatants.selected.hasBuff(SPELLS.EMPOWERED_LIFE_TAP_BUFF.id, event.timestamp)) {
      this.bonusDmg += calculateEffectiveDamage(event, ELT_DAMAGE_BONUS);
    }
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.EMPOWERED_LIFE_TAP_BUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.75,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your uptime on the <SpellLink id={SPELLS.EMPOWERED_LIFE_TAP_BUFF.id} /> buff could be improved. You should cast <SpellLink id={SPELLS.LIFE_TAP.id} /> more often.<br /><br /><small><em>NOTE:</em> If you're getting 0% uptime, it might be wrong if you used <SpellLink id={SPELLS.LIFE_TAP.id} /> before combat started and maintained the buff. Due to technical limitations it's not possible to track the bonus damage nor uptime in this case.</small></Wrapper>)
          .icon(SPELLS.EMPOWERED_LIFE_TAP_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Empowered Life Tap uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EMPOWERED_LIFE_TAP_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Empowered Life Tap uptime"
        tooltip={`Your Empowered Life Tap talent contributed ${formatNumber(this.bonusDmg)} total damage (${formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} %)`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(1);
}

export default EmpoweredLifeTap;
