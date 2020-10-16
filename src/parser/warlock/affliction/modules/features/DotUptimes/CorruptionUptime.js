import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import UptimeBar from 'interface/statistics/components/UptimeBar';

import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class CorruptionUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.CORRUPTION_DEBUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(
          <>
            Your <SpellLink id={SPELLS.CORRUPTION_CAST.id} /> uptime can be improved. Try to pay more attention to your Corruption on the boss, perhaps use some debuff tracker.
          </>,
        )
          .icon(SPELLS.CORRUPTION_CAST.icon)
          .actual(i18n._(t('warlock.affliction.suggestions.corruption.uptime')`${formatPercentage(actual)}% Corruption uptime`))
          .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.CORRUPTION_DEBUFF.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.CORRUPTION_CAST.id} />
        </div>
        <div
          className="flex-sub value"
          style={{ width: 140 }}
        >
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
    );
  }
}

export default CorruptionUptime;
