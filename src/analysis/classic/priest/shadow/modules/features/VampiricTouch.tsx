import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar from 'parser/ui/UptimeBar';

import SPELLS from 'common/SPELLS/classic';

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
          Your <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} /> uptime can be improved. Try to pay more
          attention to your <SpellLink spell={SPELLS.VAMPIRIC_TOUCH} /> on the boss.
        </span>,
      )
        .icon('spell_holy_stoicism')
        .actual(
          defineMessage({
            id: 'priest.shadow.suggestions.vampiricTouch.uptime',
            message: `${formatPercentage(actual)}% Vampiric Touch uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.VAMPIRIC_TOUCH.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon spell={SPELLS.VAMPIRIC_TOUCH} />
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
