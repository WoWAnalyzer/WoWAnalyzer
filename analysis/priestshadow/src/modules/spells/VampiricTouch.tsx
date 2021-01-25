import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { t } from '@lingui/macro';
import UptimeBar from 'parser/ui/UptimeBar';

class VampiricTouch extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.VAMPIRIC_TOUCH.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(<span>Your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> on the boss.</span>)
        .icon(SPELLS.VAMPIRIC_TOUCH.icon)
        .actual(t({
      id: "priest.shadow.suggestions.vampiricTouch.uptime",
      message: `${formatPercentage(actual)}% Vampiric Touch uptime`
    }))
        .recommended(`>${formatPercentage(recommended)}% is recommended`));
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.VAMPIRIC_TOUCH.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.VAMPIRIC_TOUCH.id} />
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

export default VampiricTouch;
