import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Statistic from 'interface/report/Results/statistics/Statistic';
import SpellValue from 'interface/report/Results/statistics/SpellValue';

class RuleOfLaw extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RULE_OF_LAW_TALENT.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.25,
        average: 0.2,
        major: 0.1,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <>
          Your <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} /> uptime can be improved. Try keeping at least 1 charge on cooldown; you should (almost) never be at max charges.
        </>
      )
        .icon(SPELLS.RULE_OF_LAW_TALENT.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }
  statistic() {
    return (
      <React.Fragment
        position={STATISTIC_ORDER.CORE(31)}>
        <Statistic
          position={STATISTIC_ORDER.CORE(31)}
          style={{ height: 'auto' }} // TODO: Rework Statistic to provide a default set of sizes
        >
          <SpellValue
            spell={SPELLS.RULE_OF_LAW_TALENT}
            value={`${formatPercentage(this.uptime)}%`}
            label="uptime"
          />
        </Statistic>
      </React.Fragment>
    );
  }
}

export default RuleOfLaw;
