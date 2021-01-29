import React from 'react';

import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import Statistic from 'parser/ui/Statistic';
import Panel from 'parser/ui/Panel';
import Analyzer from 'parser/core/Analyzer';
import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import { formatPercentage } from 'common/format';
import { t } from '@lingui/macro';
import BoringResourceValue from 'parser/ui/BoringResourceValue';

import { ThresholdStyle, When } from 'parser/core/ParseResults';

import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import MaelstromTracker from './MaelstromTracker';


const MINOR_THRESHOLD = 0;
const AVERAGE_THRESHOLD = 0.02;
const MAJOR_THRESHOLD = 0.05;

class MaelstromDetails extends Analyzer {
  static dependencies = {
    maelstromTracker: MaelstromTracker,
  };

  protected maelstromTracker!: MaelstromTracker;

  get wasted() {
    return this.maelstromTracker.wasted || 0;
  }

  get total() {
    return this.maelstromTracker.wasted + this.maelstromTracker.generated || 0;
  }

  get wastedPerMinute() {
    return (this.wasted / this.owner.fightDuration) * 1000 * 60 || 0;
  }

  get wastedPercent() {
    return this.wasted / this.total || 0;
  }

  get suggestionThresholdsWasted() {
    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: MINOR_THRESHOLD,
        average: AVERAGE_THRESHOLD,
        major: MAJOR_THRESHOLD,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholds() {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 1 - MINOR_THRESHOLD,
        average: 1 - AVERAGE_THRESHOLD,
        major: 1 - MAJOR_THRESHOLD,
      },
      style: 'percentage',
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholdsWasted)
      .addSuggestion((suggest, actual, recommended) => suggest(`You overcapped ${this.wasted} Maelstrom. Always prioritize spending it over avoiding the overcap of any other ability.`)
          .icon('spell_shadow_mindflay')
          .actual(t({
      id: "shaman.shared.suggestions.maelstrom.overcapped",
      message: `${formatPercentage(actual)}% overcapped Maelstrom`
    }))
          .recommended(`${formatPercentage(recommended)}% is recommended`));
  }

  statistic() {
    return [
      (
        <Statistic
          key="StatisticBox"
          position={STATISTIC_ORDER.CORE(1)}
          tooltip={`${this.wasted} out of ${this.total} Maelstrom wasted.`}>
            <BoringResourceValue
              resource={RESOURCE_TYPES.MAELSTROM}
              value={`${formatPercentage(this.wastedPercent)} %`}
              label="Overcapped Maelstrom"
            />
          </Statistic>
      ),
      (
        <Panel
          key="Panel"
          title="Maelstrom usage"
          position={200}
          pad={false}
        >
          <ResourceBreakdown
            tracker={this.maelstromTracker}
            showSpenders
          />
        </Panel>
      ),
    ];
  }
}

export default MaelstromDetails;
