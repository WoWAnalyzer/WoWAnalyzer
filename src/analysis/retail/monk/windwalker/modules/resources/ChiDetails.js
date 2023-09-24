// Heavily inspired by resource breakdown in Feral and Retribution

import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import ChiTracker from './ChiTracker';

class ChiDetails extends Analyzer {
  static dependencies = {
    chiTracker: ChiTracker,
  };

  get chiWasted() {
    return this.chiTracker.wasted;
  }

  get chiWastedPercent() {
    return this.chiWasted / (this.chiWasted + this.chiTracker.generated) || 0;
  }

  get chiWastedPerMinute() {
    return (this.chiWasted / this.owner.fightDuration) * 1000 * 60;
  }

  get suggestionThresholds() {
    return {
      actual: this.chiWastedPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 2,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest('You are wasting Chi. Try to use it and not let it cap and go to waste')
        .icon('creatureportrait_bubble')
        .actual(
          defineMessage({
            id: 'monk.windwalker.suggestions.chi.wastedPerMinute',
            message: `${this.chiWasted} Chi wasted (${actual.toFixed(2)} per minute)`,
          }),
        )
        .recommended(`${recommended} Chi wasted is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="small"
        position={STATISTIC_ORDER.CORE(1)}
        tooltip={<>{formatPercentage(this.chiWastedPercent)}% wasted</>}
        drilldown="../chi"
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.CHI}
          value={this.chiWasted}
          label="Wasted Chi"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Chi',
      url: 'chi',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.chiTracker} resourceName="Chi" showSpenders />
        </Panel>
      ),
    };
  }
}

export default ChiDetails;
