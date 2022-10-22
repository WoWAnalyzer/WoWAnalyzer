import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { I18nContext } from 'i18n/i18n-react';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import FuryTracker from './FuryTracker';

const furyIcon = 'ability_demonhunter_eyebeam';

class FuryDetails extends Analyzer {
  static dependencies = {
    furyTracker: FuryTracker,
  };
  protected furyTracker!: FuryTracker;

  get wastedFuryPercent() {
    return this.furyTracker.wasted / (this.furyTracker.wasted + this.furyTracker.generated);
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedFuryPercent,
      isGreaterThan: {
        minor: 0.03,
        average: 0.07,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addLocalizedSuggestion((suggest, actual, recommended) =>
      suggest((LL) =>
        LL.demonhunter.havoc.wastedFury.suggestion.base({
          amount: formatNumber(this.furyTracker.wasted),
        }),
      )
        .icon(furyIcon)
        .actualLocalized((LL) =>
          LL.demonhunter.havoc.wastedFury.suggestion.actual({ amount: formatPercentage(actual) }),
        )
        .recommendedLocalized((LL) =>
          LL.demonhunter.havoc.wastedFury.suggestion.recommend({
            amount: formatPercentage(recommended),
          }),
        ),
    );
  }

  statistic() {
    return (
      <I18nContext.Consumer>
        {(i18n) => (
          <Statistic
            size="small"
            position={STATISTIC_ORDER.CORE(4)}
            tooltip={i18n.LL.demonhunter.havoc.wastedFury.statistic.tooltip({
              amount: formatPercentage(this.wastedFuryPercent),
            })}
          >
            <BoringResourceValue
              resource={RESOURCE_TYPES.FURY}
              value={formatNumber(this.furyTracker.wasted)}
              label={i18n.LL.demonhunter.havoc.wastedFury.statistic.subtitle()}
            />
          </Statistic>
        )}
      </I18nContext.Consumer>
    );
  }

  tab() {
    return {
      title: 'Fury Usage',
      url: 'fury-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.furyTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default FuryDetails;
