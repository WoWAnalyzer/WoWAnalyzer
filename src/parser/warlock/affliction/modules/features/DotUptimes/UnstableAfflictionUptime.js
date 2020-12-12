import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';

import UptimeBar from 'interface/statistics/components/UptimeBar';

import { t } from '@lingui/macro';

class UnstableAfflictionUptime extends Analyzer {

  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.UNSTABLE_AFFLICTION.id) / this.owner.fightDuration;
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
            Your <SpellLink id={SPELLS.UNSTABLE_AFFLICTION.id} /> uptime can be improved. Try to pay more attention to your Unstable Affliction on the boss, perhaps use some debuff tracker.
          </>,
        )
          .icon(SPELLS.UNSTABLE_AFFLICTION.icon)
          .actual(t({
      id: "warlock.affliction.suggestions.unstableAffliction.uptime",
      message: `${formatPercentage(actual)}% Unstable Affliction uptime.`
    }))
          .recommended(`> ${formatPercentage(recommended)}% is recommended`));
  }

  subStatistic() {
    const history = this.enemies.getCombinedDebuffHistory([SPELLS.UNSTABLE_AFFLICTION.id]);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.UNSTABLE_AFFLICTION.id} />
        </div>
        <div
            className="flex-sub value"
            style={{
              width: 140,
              paddingRight: 8, // to compensate for the asterisk and align % values
            }}
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

export default UnstableAfflictionUptime;
