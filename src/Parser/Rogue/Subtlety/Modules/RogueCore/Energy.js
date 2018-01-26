import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import resourceSuggest from 'Parser/Core/Modules/ResourceTracker/ResourceSuggest';

import EnergyTracker from '../../../Common/Resources/EnergyTracker';

class Energy extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };
  
  suggestions(when) {
    resourceSuggest(when,  this.energyTracker, {
      spell: SPELLS.SYMBOLS_OF_DEATH,
      minor: 0.10,
      avg: 0.20, 
      major: 0.50,
      extraSuggestion: <Wrapper>Try to spend energy before using <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} />, but do not delay it to avoid waste! </Wrapper>,
    });
      
    resourceSuggest(when,  this.energyTracker, {
      spell: SPELLS.RELENTLESS_STRIKES,
      minor: 0.15,
      avg: 0.25, 
      major: 0.40,
      extraSuggestion: <Wrapper> You are wasting more energy then normal. You may be pooling too much energy or not casting enough spenders. </Wrapper>,
    });
  }
}

export default Energy;
