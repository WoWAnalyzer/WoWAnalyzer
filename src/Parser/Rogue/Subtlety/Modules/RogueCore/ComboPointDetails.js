import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';

import ComboPointTracker from './ComboPointTracker';

import ResourceBreakdown from '../ResourceTracker/ResourceBreakdown';

class ComboPointDetails extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };
  
  suggestions(when) {
    const pointsWasted = this.comboPointTracker.pointsWasted;
    const pointsWastedPerMinute = (pointsWasted / this.owner.fightDuration) * 1000 * 60;
    const MINOR = 5;
    const AVG = 10;
    const MAJOR = 15;
    when(pointsWastedPerMinute).isGreaterThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Combo Points. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon('creatureportrait_bubble')
          .actual(`${pointsWasted} Combo Points wasted (${pointsWastedPerMinute.toFixed(2)} per minute)`)
          .recommended(`< ${recommended.toFixed(2)} Combo Points per minute wasted are recommended`)
          .regular(AVG).major(MAJOR);
      });
  }

  statistic() {
    const pointsWasted = this.comboPointTracker.wasted;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_TECHNIQUES.id} />}
        value={`${pointsWasted}`}
        label="Wasted Combo Points"
      />
    );
  }

  tab() {
    return {
      title: 'Combo Point usage',
      url: 'combo-points',
      render: () => (
        <Tab title="Combo Point usage breakdown">
          <ResourceBreakdown
            pointsGained={this.comboPointTracker.gainedArray}
            pointsSpent={this.comboPointTracker.spentArray}
            pointsWasted={this.comboPointTracker.wastedArray}
            pointsCast={this.comboPointTracker.castsArray}
            resourceName="Combo Points"
          />
        </Tab>
      ),
    };
 }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default ComboPointDetails;
