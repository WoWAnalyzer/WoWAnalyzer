import React from 'react';
import { Trans } from '@lingui/macro';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import StatisticBar from 'interface/statistics/StatisticBar';
import UptimeBar from 'interface/statistics/components/UptimeBar';
import SpellIcon from 'common/SpellIcon';

class RuleOfLaw extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.RULE_OF_LAW_TALENT.id);
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.RULE_OF_LAW_TALENT.id) / this.owner.fightDuration
    );
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
        <Trans>
          Your <SpellLink id={SPELLS.RULE_OF_LAW_TALENT.id} /> uptime can be improved. Try keeping
          at least 1 charge on cooldown; you should (almost) never be at max charges.
        </Trans>,
      )
        .icon(SPELLS.RULE_OF_LAW_TALENT.icon)
        .actual(<Trans>{formatPercentage(actual)}% uptime</Trans>)
        .recommended(<Trans>&gt;{formatPercentage(recommended)}% is recommended</Trans>);
    });
  }
  statistic() {
    const history = this.selectedCombatant.getBuffHistory(SPELLS.RULE_OF_LAW_TALENT.id);

    return (
      <StatisticBar position={STATISTIC_ORDER.CORE(31)} wide size="small">
        <div className="flex">
          <div className="flex-sub icon">
            <SpellIcon id={SPELLS.RULE_OF_LAW_TALENT.id} />
          </div>
          <div className="flex-sub value">
            <Trans>
              {formatPercentage(this.uptime, 0)}% <small>uptime</small>
            </Trans>
          </div>
          <div className="flex-main chart" style={{ padding: 15 }}>
            <UptimeBar
              uptimeHistory={history}
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
              style={{ height: '100%' }}
            />
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default RuleOfLaw;
