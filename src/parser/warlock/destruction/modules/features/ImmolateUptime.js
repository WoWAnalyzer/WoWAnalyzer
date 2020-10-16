import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import StatisticBar from 'interface/statistics/StatisticBar';
import UptimeBar from 'interface/statistics/components/UptimeBar';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class ImmolateUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.IMMOLATE_DEBUFF.id) / this.owner.fightDuration;
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
      .addSuggestion((suggest, actual, recommended) => suggest(<>Your <SpellLink id={SPELLS.IMMOLATE_DEBUFF.id} /> uptime can be improved. Try to pay more attention to it as it provides a significant amount of Soul Shard Fragments over the fight and is also a big portion of your total damage.</>)
          .icon(SPELLS.IMMOLATE_DEBUFF.icon)
          .actual(i18n._(t('warlock.destruction.suggestions.immolate.uptime')`${formatPercentage(actual)}% Immolate uptime`))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.IMMOLATE_DEBUFF.id);
    return (
      <StatisticBar
        wide
        position={STATISTIC_ORDER.CORE(1)}
      >
        <div className="flex">
          <div className="flex-sub icon">
            <SpellIcon id={SPELLS.IMMOLATE.id} />
          </div>
          <div className="flex-sub value">
            {formatPercentage(this.uptime, 0)} % <small>uptime</small>
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

export default ImmolateUptime;
