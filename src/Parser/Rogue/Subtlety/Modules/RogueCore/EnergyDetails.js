import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';

import EnergyTracker from './EnergyTracker';

import ResourceBreakdown from '../ResourceTracker/ResourceBreakdown';

class EnergyDetails extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };
  
  suggestions(when) {
    const energyWasted = this.energyTracker.wasted;
    const energyWastedPerMinute = (energyWasted / this.owner.fightDuration) * 1000 * 60;
    const MINOR = 5;
    const AVG = 10;
    const MAJOR = 15;
    when(energyWastedPerMinute).isGreaterThan(MINOR)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are wasting Combo Points. Try to use them and not let them cap and go to waste unless you\'re preparing for bursting adds etc.')
          .icon('creatureportrait_bubble')
          .actual(`${energyWasted} Combo Points wasted (${energyWastedPerMinute.toFixed(2)} per minute)`)
          .recommended(`< ${recommended.toFixed(2)} Combo Points per minute wasted are recommended`)
          .regular(AVG).major(MAJOR);
      });
  }

  statistic() {
    const energyWasted = this.energyTracker.wasted;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_TECHNIQUES.id} />}
        value={`${energyWasted}`}
        label="Wasted Energy"
      />
    );
  }

  tab() {
    return {
      title: 'Energy usage',
      url: 'energy',
      render: () => (
        <Tab title="Enery usage breakdown">
          <ResourceBreakdown
            pointsGained={this.energyTracker.gainedArray}
            pointsSpent={this.energyTracker.spentArray}
            pointsWasted={this.energyTracker.wastedArray}
            pointsCast={this.energyTracker.castsArray}
            resourceName="energy"
          />
        </Tab>
      ),
    };
 }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default EnergyDetails;
