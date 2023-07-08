import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import StatisticBar from 'parser/ui/StatisticBar';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import UptimeBar, { Uptime } from 'parser/ui/UptimeBar';

class RuleOfLaw extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RULE_OF_LAW_TALENT);
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(TALENTS.RULE_OF_LAW_TALENT.id) / this.owner.fightDuration
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
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  suggestions(when: When) {
    when(this.uptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="paladin.holy.modules.talents.ruleOfLaw.suggestion">
          Your <SpellLink spell={TALENTS.RULE_OF_LAW_TALENT} /> uptime can be improved. Try keeping
          at least 1 charge on cooldown; you should (almost) never be at max charges.
        </Trans>,
      )
        .icon(TALENTS.RULE_OF_LAW_TALENT.icon)
        .actual(
          <Trans id="paladin.holy.modules.talents.ruleOfLaw.actual">
            {formatPercentage(actual)}% uptime
          </Trans>,
        )
        .recommended(
          <Trans id="paladin.holy.modules.talents.ruleOfLaw.recommended">
            &gt;{formatPercentage(recommended)}% is recommended
          </Trans>,
        ),
    );
  }
  statistic() {
    const history = this.selectedCombatant.getBuffHistory(TALENTS.RULE_OF_LAW_TALENT.id);

    const uptime: Uptime[] = [];

    history.forEach((buff) => {
      uptime.push({
        start: buff.start,
        end: buff.end || 0,
      });
    });

    return (
      <StatisticBar position={STATISTIC_ORDER.CORE(31)} wide>
        <div className="flex">
          <div className="flex-sub icon">
            <SpellIcon spell={TALENTS.RULE_OF_LAW_TALENT} />
          </div>
          <div className="flex-sub value">
            <Trans id="paladin.holy.modules.talents.ruleOfLaw.smallUptime">
              {formatPercentage(this.uptime, 0)}% <small>uptime</small>
            </Trans>
          </div>
          <div className="flex-main chart" style={{ padding: 15 }}>
            <UptimeBar
              uptimeHistory={uptime}
              start={this.owner.fight.start_time}
              end={this.owner.fight.end_time}
            />
          </div>
        </div>
      </StatisticBar>
    );
  }
}

export default RuleOfLaw;
