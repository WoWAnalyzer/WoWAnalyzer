import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import RunicPowerTracker from './RunicPowerTracker';

class RunicPowerDetails extends Analyzer {
  static dependencies = {
    runicPowerTracker: RunicPowerTracker,
  };

  protected runicPowerTracker!: RunicPowerTracker;

  get wastedPercent() {
    return (
      this.runicPowerTracker.wasted /
        (this.runicPowerTracker.wasted + this.runicPowerTracker.generated) || 0
    );
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
      suggest(
        t({
          id: 'deathknight.frost.runicPower.suggestion.suggestion',
          message: `You wasted ${formatPercentage(this.wastedPercent)}% of your Runic Power.`,
        }),
      )
        .icon('inv_sword_62')
        .actual(
          t({
            id: 'deathknight.frost.runicPower.suggestion.actual',
            message: `${formatPercentage(actual)}% wasted`,
          }),
        )
        .recommended(
          t({
            id: 'deathknight.frost.runicPower.suggestion.recommended',
            message: `<${formatPercentage(recommended)}% is recommended`,
          }),
        ),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="small"
        tooltip={t({
          id: 'deathknight.frost.runicPower.statistic.tooltip',
          message: `${this.runicPowerTracker.wasted} out of ${
            this.runicPowerTracker.wasted + this.runicPowerTracker.generated
          } runic power wasted.`,
        })}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.RUNIC_POWER}
          value={`${formatPercentage(this.wastedPercent)} %`}
          label={t({ id: 'deathknight.frost.runicPower.statistic', message: 'Runic Power wasted' })}
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: t({ id: 'deathknight.frost.runicPower.tab', message: 'Runic Power usage' }),
      url: 'runic-power-usage',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.runicPowerTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default RunicPowerDetails;
