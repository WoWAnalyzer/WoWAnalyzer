import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Tab from 'Main/Tab';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import ComboPointTracker from './ComboPointTracker';

import ResourceBreakdown from '../ResourceTracker/ResourceBreakdown';
import resourceSuggest from '../ResourceTracker/ResourceSuggest';

class ComboPointDetails extends Analyzer {
  static dependencies = {
    comboPointTracker: ComboPointTracker,
  };
  

  makeExtraSuggestion(spell) {
    return <Wrapper>Avoid wasting combo points when casting <SpellLink id={spell.id}  /> </Wrapper>;
  }


  suggestions(when) {    
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.BACKSTAB,
      minor: 0.05,
      avg: 0.10, 
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.BACKSTAB),
    }); 
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.GLOOMBLADE_TALENT,
      minor: 0.05,
      avg: 0.10, 
      major: 0.15,      
      extraSuggestion: this.makeExtraSuggestion(SPELLS.GLOOMBLADE_TALENT),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.SHADOWSTRIKE,
      minor: 0.05,
      avg: 0.10, 
      major: 0.15,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHADOWSTRIKE),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.SHURIKEN_STORM,
      minor: 0.1,
      avg: 0.2, 
      major: 0.3,
      extraSuggestion: this.makeExtraSuggestion(SPELLS.SHURIKEN_STORM),
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.SHADOW_TECHNIQUES,
      minor: 0.1,
      avg: 0.2, 
      major: 0.3,
      extraSuggestion: <span> Use a weak Aura to track <SpellLink id={SPELLS.SHADOW_TECHNIQUES.id}/>. This is an advanced suggestion and should not be addressed first. </span>,
    });
    resourceSuggest(when,  this.comboPointTracker, {
      spell: SPELLS.GOREMAWS_BITE_ENERGY,
      minor: 0.05,
      avg: 0.1, 
      major: 0.15,
      extraSuggestion: <span> Cast <SpellLink id={SPELLS.GOREMAWS_BITE.id}/> when you are on or below 3 combo points </span>,
    });
    }

  statistic() {
    const pointsWasted = this.comboPointTracker.wasted;
    const pointsWastedPerMinute = (pointsWasted / this.owner.fightDuration) * 1000 * 60;
    return (
      <StatisticBox
        icon={<Icon icon="ability_rogue_masterofsubtlety" alt="Waisted Combo Points" />}
        value={`${pointsWastedPerMinute.toFixed(2)}`}
        label="Wasted Combo Points per minute"
        tooltip={`You waisted a total of ${pointsWasted} combo points. Some waste is expected due to the random nature of some generation abilities.`}
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
            tracker={this.comboPointTracker}
            resourceName="Combo Points"
            showSpenders={true}
          />
        </Tab>
      ),
    };
 }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default ComboPointDetails;
