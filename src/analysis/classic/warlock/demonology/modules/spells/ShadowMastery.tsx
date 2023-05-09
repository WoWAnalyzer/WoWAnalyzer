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

class ShadowMasteryUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    // Only counts uptime for selected player
    return this.enemies.getBuffUptime(SPELLS.SHADOW_MASTERY_DEBUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      // TODO: Query for total uptime on boss (see `useThreatTable` for example)
      // Shadow Mastery can be maintained by all Warlocks
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
          Uptime on the <SpellLink id={SPELLS.SHADOW_MASTERY_DEBUFF} /> debuff can be improved. If
          there are multiple Warlocks in your raid, assign someone to keep up the debuff.
        </>,
      )
        .icon(SPELLS.SHADOW_MASTERY_DEBUFF.icon)
        .actual(
          t({
            id: 'warlock.suggestions.shadowmastery.uptime',
            message: `${formatPercentage(actual)}% Shadow Mastery uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  get uptimeHistory() {
    return this.enemies.getDebuffHistory(SPELLS.SHADOW_MASTERY_DEBUFF.id);
  }

  subStatistic() {
    return uptimeBarSubStatistic(this.owner.fight, {
      spells: [SPELLS.SHADOW_MASTERY_DEBUFF],
      uptimes: this.uptimeHistory,
      color: SPELL_COLORS.SHADOW_MASTERY,
      perf: this.DowntimePerformance,
    });
  }
}

export default ShadowMasteryUptime;
