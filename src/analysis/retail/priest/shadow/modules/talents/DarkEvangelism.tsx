import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import { Uptime } from 'parser/ui/UptimeBar';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';

const BAR_COLOR = '#9933cc';

class DarkEvangelism extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DARK_EVANGELISM_TALENT);
  }
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.DARK_EVANGELISM_TALENT_BUFF.id) /
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
          Your <SpellLink id={TALENTS.DARK_EVANGELISM_TALENT.id} /> uptime can be improved. Try to
          pay more attention to your <SpellLink id={TALENTS.DARK_EVANGELISM_TALENT.id} /> buff.
        </span>,
      )
        .icon(TALENTS.DARK_EVANGELISM_TALENT.icon)
        .actual(
          t({
            id: 'priest.shadow.suggestions.darkEvangilism.uptime',
            message: `${formatPercentage(actual)}% Dark Evangilism uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    const history = this.selectedCombatant.getBuffHistory(SPELLS.DARK_EVANGELISM_TALENT_BUFF.id);
    const uptime: Uptime[] = [];

    history.forEach((buff) => {
      uptime.push({
        start: buff.start,
        end: buff.end || 0,
      });
    });
    return uptime;
  }
  //TODO: fix percentage for protype view
  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.DARK_EVANGELISM_TALENT_BUFF],
      uptimes: this.uptimeHistory,
      color: BAR_COLOR,
    });
  }
}

export default DarkEvangelism;
