import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
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
        minor: 0.15,
        average: 0.2,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(`You wasted ${formatNumber(this.furyTracker.wasted)} Fury.`)
        .icon(furyIcon)
        .actual(
          t({
            id: 'demonhunter.havoc.suggestions.fury.wasted',
            message: `${formatPercentage(actual)}% Fury wasted`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="small"
        position={STATISTIC_ORDER.CORE(4)}
        tooltip={`${formatPercentage(this.wastedFuryPercent)}% wasted`}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.FURY}
          value={formatNumber(this.furyTracker.wasted)}
          label="Fury Wasted"
        />
      </Statistic>
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
