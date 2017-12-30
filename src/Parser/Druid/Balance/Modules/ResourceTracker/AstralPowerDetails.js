import React from 'react';

import resourceSuggest from 'Parser/Rogue/Subtlety/Modules/ResourceTracker/ResourceSuggest';
import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Icon from 'common/Icon';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';

import AstralPowerTracker from './AstralPowerTracker';
import AstralPowerBreakdown from './AstralPowerBreakdown';

class AstralPowerDetails extends Analyzer {
  static dependencies = {
    astralPowerTracker: AstralPowerTracker,
  };
  
  suggestions(when) {     
    resourceSuggest(when, this.astralPowerTracker, {
      spell: SPELLS.RELENTLESS_STRIKES,
      minor: 0.0,
      avg: 0.02, 
      major: 0.5,
      extraSuggestion: <Wrapper> You are wasting more Astral Power. Always prioritize spending it over avoiding the overcap of any other ability. </Wrapper>,
    });
  }


  statistic() {
    const astralPowerWasted = this.astralPowerTracker.wasted;
    const pointsWastedPerMinute = (astralPowerWasted / this.owner.fightDuration) * 1000 * 60;
    return (
      <StatisticBox      
        icon={<Icon icon="ability_warrior_decisivestrike" alt="Wasted Astral Power" />}
        value={`${pointsWastedPerMinute.toFixed(2)}`}
        label="Wasted Astral Power per minute"
        tooltip={`You wasted a total of ${astralPowerWasted} Astral Power.`}        
      />
    );
  }

  tab() {
    return {
      title: 'Astral Power usage',
      url: 'astral-power-usage',
      render: () => (
        <Tab title="Astral Power usage breakdown">
          <AstralPowerBreakdown
            tracker={this.astralPowerTracker}
            resourceName="Astral Power"
            showSpenders={true}
          />
        </Tab>
      ),
    };
 }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default AstralPowerDetails;
