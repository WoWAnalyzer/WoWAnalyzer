import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar from 'parser/ui/UptimeBar';
import React from 'react';

import { CURSE_OF_AGONY, CURSE_OF_DOOM, CURSE_OF_THE_ELEMENTS } from '../../SPELLS';

class CurseOfTheElements extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return (
      (this.enemies.getBuffUptime(CURSE_OF_AGONY) +
        this.enemies.getBuffUptime(CURSE_OF_DOOM) +
        this.enemies.getBuffUptime(CURSE_OF_THE_ELEMENTS)) /
      this.owner.fightDuration
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink id={CURSE_OF_THE_ELEMENTS} /> uptime can be improved. Try to pay more
          attention to your <SpellLink id={CURSE_OF_THE_ELEMENTS} /> on the boss.
        </span>,
      )
        .actual(
          t({
            id: 'priest.shadow.suggestions.vampiricTouch.uptime',
            message: `${formatPercentage(actual)}% Vampiric Touch uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(CURSE_OF_THE_ELEMENTS);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={CURSE_OF_THE_ELEMENTS} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)}% <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
          />
        </div>
      </div>
    );
  }
}

export default CurseOfTheElements;
