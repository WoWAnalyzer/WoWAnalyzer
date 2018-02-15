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
      spell: SPELLS.COMBAT_POTENCY,
      minor: 0.05,
      avg: 0.1, 
      major: 0.15,
      extraSuggestion: <Wrapper> Try to keep energy below max to avoid waisting <SpellLink id={SPELLS.COMBAT_POTENCY.id} /> procs. </Wrapper>,
    });
  }
}

export default Energy;
