import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import EnergyTracker from './EnergyTracker';

import ResourceBreakdown from '../ResourceTracker/ResourceBreakdown';
import resourceSuggest from './../ResourceTracker/ResourceSuggest';

class EnergyDetails extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };
  
  suggestions(when) {
    resourceSuggest(when,  this.energyTracker, {
      spell: SPELLS.SYMBOLS_OF_DEATH,
      minor: 0.05,
      avg: 0.10, 
      major: 0.15,
      extraSuggestion: <span>Try to spend energy before using <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} />, but do not delay it to avoid waste! </span>,
    });
      
    resourceSuggest(when,  this.energyTracker, {
      spell: SPELLS.RELENTLESS_STRIKES,
      minor: 0.15,
      avg: 0.2, 
      major: 0.25,
      extraSuggestion: <span> You are wasting more energy then normal. It may be pooling too much energy or not casting enough spenders. </span>,
    });
  }


  statistic() {
    const energyWasted = this.energyTracker.wasted;
    const pointsWastedPerMinute = (energyWasted / this.owner.fightDuration) * 1000 * 60;
    return (
      <StatisticBox      
        icon={<Icon icon="ability_warrior_decisivestrike" alt="Waisted Energy" />}
        value={`${pointsWastedPerMinute.toFixed(2)}`}
        label="Wasted Energy per minute"
        tooltip={`You waisted a total of ${energyWasted} energy. Some waste is expected due to the random nature of some generation abilities.`}        
      />
    );
  }

  tab() {
    return {
      title: 'Energy usage',
      url: 'energy',
      render: () => (
        <Tab title="Energy usage breakdown">
          <ResourceBreakdown
            tracker={this.energyTracker}
            resourceName="Energy"
          />
        </Tab>
      ),
    };
 }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default EnergyDetails;
