import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar from 'parser/ui/UptimeBar';

class DeepWoundsUptime extends Analyzer {
  get uptime() {
    return (
      this.enemies.getBuffUptime(SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id) / this.owner.fightDuration
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.8,
        average: 0.7,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={SPELLS.MASTERY_DEEP_WOUNDS} /> uptime can be improved. Try to use
          your core abilities more often to apply <SpellLink spell={SPELLS.DEEP_WOUNDS} /> on your
          target
        </>,
      )
        .icon(SPELLS.MASTERY_DEEP_WOUNDS.icon)
        .actual(
          defineMessage({
            id: 'warrior.arms.suggestions.deepWounds.uptime',
            message: `${formatPercentage(actual)}% Deep Wounds uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon spell={SPELLS.MASTERY_DEEP_WOUNDS} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)}% <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 10 }}>
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

export default DeepWoundsUptime;
