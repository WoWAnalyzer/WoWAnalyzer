import { t } from '@lingui/macro';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Panel } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringResourceValue from 'parser/ui/BoringResourceValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import ResourceBreakdown from './ComboPointBreakdown';
import ComboPointTracker from './ComboPointTracker';

class ComboPointDetails extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  comboPointTracker!: ComboPointTracker;

  get pointsWasted() {
    return this.comboPointTracker.wasted - this.comboPointTracker.unavoidableWaste;
  }

  get pointsWastedPerMinute() {
    return (this.pointsWasted / this.owner.fightDuration) * 1000 * 60;
  }

  get wastingSuggestionThresholds() {
    return {
      actual: this.pointsWastedPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 5,
        major: 10,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  suggestions(when: When) {
    when(this.wastingSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(<>You are wasting combo points. Avoid using generators once you reach the maximum.</>)
        .icon('creatureportrait_bubble')
        .actual(
          t({
            id: 'druid.feral.suggestions.comboPoints.wasted',
            message: `${actual.toFixed(1)} combo points wasted per minute`,
          }),
        )
        .recommended('zero waste is recommended'),
    );
  }

  statistic() {
    return (
      <Statistic
        size="small"
        tooltip={
          <>
            You wasted a total of <strong>{this.pointsWasted}</strong> combo points. <br />
            This number does NOT include Primal Fury procs that happened on a point builder used at
            4 CPs, because this waste can't be controlled.
          </>
        }
        position={STATISTIC_ORDER.CORE(6)}
      >
        <BoringResourceValue
          resource={RESOURCE_TYPES.COMBO_POINTS}
          value={`${this.pointsWastedPerMinute.toFixed(1)}`}
          label="Wasted Combo Points per minute"
        />
      </Statistic>
    );
  }

  tab() {
    return {
      title: 'Combo Point usage',
      url: 'combo-points',
      render: () => (
        <Panel>
          <ResourceBreakdown tracker={this.comboPointTracker} showSpenders />
        </Panel>
      ),
    };
  }
}

export default ComboPointDetails;
