import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Options } from 'parser/core/EventSubscriber';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar from 'parser/ui/UptimeBar';

/**
 * Example report: /report/gXbFvNaJTBf39jYV/1-LFR+Taloc+-+Kill+(4:06)/4-Dimentionz
 */

class RendUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.REND_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.7,
        average: 0.65,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.REND_TALENT);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.REND_TALENT.id} /> uptime can be improved. If you choose this
          talent, you better use it !
        </>,
      )
        .icon(SPELLS.REND_TALENT.icon)
        .actual(
          t({
            id: 'warrior.arms.suggestions.rend.uptime',
            message: `${formatPercentage(actual)}% Rend uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(SPELLS.REND_TALENT.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.REND_TALENT.id} />
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

export default RendUptime;
