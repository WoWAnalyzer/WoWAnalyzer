import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import uptimeBarSubStatistic from 'parser/ui/UptimeBarSubStatistic';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS/classic/warlock';
import { SPELL_COLORS } from '../../constants';

class ImmolateUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.IMMOLATE.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get DowntimePerformance(): QualitativePerformance {
    const suggestionThresholds = this.suggestionThresholds.isLessThan;
    if (this.uptime > suggestionThresholds.minor) {
      return QualitativePerformance.Perfect;
    }
    if (this.uptime >= suggestionThresholds.minor) {
      return QualitativePerformance.Good;
    }
    if (this.uptime >= suggestionThresholds.average) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink spell={SPELLS.IMMOLATE} /> uptime can be improved. If necessary, use a
          debuff tracker to see your uptime on the boss.
        </>,
      )
        .icon(SPELLS.IMMOLATE.icon)
        .actual(
          t({
            id: 'warlock.destruction.suggestions.immolate.uptime',
            message: `${formatPercentage(actual)}% Immolate uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.IMMOLATE.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.IMMOLATE],
      uptimes: this.uptimeHistory,
      color: SPELL_COLORS.IMMOLATE,
      perf: this.DowntimePerformance,
    });
  }
}

export default ImmolateUptime;
