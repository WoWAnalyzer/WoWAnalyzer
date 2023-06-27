import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/warlock';
import { SpellIcon, SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import UptimeBar from 'parser/ui/UptimeBar';

class SiphonLifeUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(TALENTS.SIPHON_LIFE_TALENT.id) / this.owner.fightDuration;
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

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SIPHON_LIFE_TALENT);
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={TALENTS.SIPHON_LIFE_TALENT.id} /> uptime can be improved. Try to pay
          more attention to your Siphon Life on the boss, perhaps use some debuff tracker.
        </>,
      )
        .icon(TALENTS.SIPHON_LIFE_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Siphon Life uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  subStatistic() {
    const history = this.enemies.getDebuffHistory(TALENTS.SIPHON_LIFE_TALENT.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={TALENTS.SIPHON_LIFE_TALENT.id} />
        </div>
        <div className="flex-sub value" style={{ width: 140 }}>
          {formatPercentage(this.uptime, 0)} % <small>uptime</small>
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

export default SiphonLifeUptime;
