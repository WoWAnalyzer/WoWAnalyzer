import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Panel from 'interface/others/Panel';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import ResourceBreakdown from './ComboPointBreakdown';
import WastedPointsIcon from '../images/feralComboPointIcon.png';
import ComboPointTracker from './ComboPointTracker';


class ComboPointDetails extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

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
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.wastingSuggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          You are wasting combo points. Avoid using generators once you reach the maximum.
        </>,
      )
        .icon('creatureportrait_bubble')
        .actual(i18n._(t('druid.feral.suggestions.comboPoints.wasted')`${actual.toFixed(1)} combo points wasted per minute`))
        .recommended('zero waste is recommended'));
  }

  statistic() {
    return (
      <StatisticBox
        icon={(
          <img
            src={WastedPointsIcon}
            alt="Wasted Combo Points"
          />
        )}
        value={this.pointsWastedPerMinute.toFixed(2)}
        label="Wasted Combo Points per minute"
        tooltip={<>You wasted a total of <strong>{this.pointsWasted}</strong> combo points. This number does NOT include Primal Fury procs that happened on a point builder used at 4 CPs, because this waste can't be controlled.</>}
        position={STATISTIC_ORDER.CORE(6)}
      />
    );
  }

  tab() {
    return {
      title: 'Combo Point usage',
      url: 'combo-points',
      render: () => (
        <Panel>
          <ResourceBreakdown
            tracker={this.comboPointTracker}
            showSpenders
          />
        </Panel>
      ),
    };
 }
}

export default ComboPointDetails;
