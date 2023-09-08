import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { GlobalCooldownEvent } from 'parser/core/Events';
import getUptimeGraph, { UptimeHistoryEntry } from 'parser/shared/modules/getUptimeGraph';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  position = STATISTIC_ORDER.CORE(6);

  uptimeHistory: UptimeHistoryEntry[] = [];

  onGCD(event: GlobalCooldownEvent) {
    const super_result = super.onGCD(event);

    this.uptimeHistory.push({
      timestamp: this.owner.currentTimestamp,
      uptimePct: this.activeTimePercentage,
    });

    return super_result;
  }

  get graphSubsection() {
    return getUptimeGraph(this.uptimeHistory, this.owner.fight.start_time);
  }

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        'Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots.',
      )
        .icon('spell_mage_altertime')
        .actual(
          defineMessage({
            id: 'priest.shadow.suggestions.alwaysBeCasting.downtime',
            message: `${formatPercentage(actual)}% downtime`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  get DowntimePerformance(): QualitativePerformance {
    const downtime = this.downtimePercentage;
    if (downtime <= 0.1) {
      return QualitativePerformance.Perfect;
    }
    if (downtime <= 0.15) {
      return QualitativePerformance.Good;
    }
    if (downtime <= 0.2) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}

export default AlwaysBeCasting;
