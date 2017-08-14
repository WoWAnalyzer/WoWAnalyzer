import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class RuleOfLaw extends Module {
  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id);
    }
  }

  get uptime() {
    return this.owner.selectedCombatant.getBuffUptime(SPELLS.RULE_OF_LAW_TALENT.id) / this.owner.fightDuration;
  }

  suggestions(when) {
    when(this.uptime).isLessThan(0.25)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} /> uptime can be improved. Try keeping at least 1 charge on cooldown; you should (almost) never be at max charges.</span>)
          .icon(SPELLS.RULE_OF_LAW_TALENT.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RULE_OF_LAW_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Rule of Law uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(31);
}

export default RuleOfLaw;
