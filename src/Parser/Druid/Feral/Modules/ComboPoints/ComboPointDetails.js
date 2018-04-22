import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import ResourceBreakdown from './ComboPointBreakdown';

import WastedPointsIcon from '../Images/feralComboPointIcon.png';

import ComboPointTracker from './ComboPointTracker';


class ComboPointDetails extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };

  get pointsWasted() {
    return this.comboPointTracker.wasted;
  }

  get pointsWastedPerMinute() {
    return (this.pointsWasted / this.owner.fightDuration) * 1000 * 60;
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
        value={`${this.pointsWastedPerMinute.toFixed(2)}`}
        label="Wasted Combo Points per minute"
        tooltip={`You wasted a total of <b>${this.pointsWasted}</b> combo points. This number does NOT include Primal Fury procs that happened on a point builder used at 4 CPs, because this waste can't be controlled.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);

  get suggestionThresholds() {
    return {
      actual: this.pointsWastedPerMinute,
      isGreaterThan: {
        minor: 5,
        average: 10,
        major: 15,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Combo Points. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon('creatureportrait_bubble')
          .actual(`${this.pointsWasted} Combo Points wasted (${this.pointsWastedPerMinute.toFixed(2)} per minute)`)
          .recommended(`< ${recommended.toFixed(2)} Combo Points per minute wasted are recommended`);
      });


    const maxComboPointCasts = Object.values(this.comboPointTracker.spendersObj).reduce((acc, spell) => acc + spell.spentByCast.filter(cps => cps === 5).length, 0);
    const totalCasts = this.comboPointTracker.spendersCasts;
    const maxComboPointPercent = maxComboPointCasts / totalCasts;

    when(maxComboPointPercent).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>You are casting too many finishers with less that 5 combo points. Try to make sure that you are generating 5 combo points before casting a finisher unless it is an emergency.</React.Fragment>)
          .icon('creatureportrait_bubble')
          .actual(`${formatPercentage(actual)}% of finishers were cast with 5 combo points`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.10);
      });
  }

  tab() {
    return {
      title: 'Combo Point usage',
      url: 'combo-points',
      render: () => (
        <Tab>
          <ResourceBreakdown
            tracker={this.comboPointTracker}
            showSpenders={true}
          />
        </Tab>
      ),
    };
 }
}

export default ComboPointDetails;
