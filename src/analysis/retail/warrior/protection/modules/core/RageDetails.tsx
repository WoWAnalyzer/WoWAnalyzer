import { defineMessage } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import { Icon } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringValueText from 'parser/ui/BoringValueText';
import Panel from 'parser/ui/Panel';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import RageTracker from './RageTracker';

class RageDetails extends Analyzer {
  static dependencies = {
    rageTracker: RageTracker,
  };
  protected rageTracker!: RageTracker;

  get wastedPercent() {
    return this.rageTracker.wasted / (this.rageTracker.wasted + this.rageTracker.generated) || 0;
  }

  get efficiencySuggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholds() {
    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.15,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Rage.`)
        .icon('spell_nature_reincarnation')
        .actual(
          defineMessage({
            id: 'warrior.protection.suggestions.rage.wasted',
            message: `${formatPercentage(actual)}% wasted`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return [
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={`${this.rageTracker.wasted} out of ${
          this.rageTracker.wasted + this.rageTracker.generated
        } Rage wasted.`}
        key={0}
      >
        <BoringValueText
          label={
            <>
              <Icon icon="spell_nature_reincarnation" /> Rage Wasted
            </>
          }
        >
          {formatNumber(this.rageTracker.wasted)}
        </BoringValueText>
      </Statistic>,

      <Panel title="Rage Usage" position={100} key={1}>
        <ResourceBreakdown tracker={this.rageTracker} showSpenders />
      </Panel>,
    ];
  }
}

export default RageDetails;
