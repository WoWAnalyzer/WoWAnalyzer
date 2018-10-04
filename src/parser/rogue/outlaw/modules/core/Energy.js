import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import resourceSuggest from 'parser/core/modules/resourcetracker/ResourceSuggest';

import EnergyTracker from '../../../shared/resources/EnergyTracker';

class Energy extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };
  
  suggestions(when) {
    resourceSuggest(when, this.energyTracker, {
      spell: SPELLS.COMBAT_POTENCY,
      minor: 0.05,
      avg: 0.1, 
      major: 0.15,
      extraSuggestion: <React.Fragment>Try to keep energy below max to avoid waisting <SpellLink id={SPELLS.COMBAT_POTENCY.id} /> procs.</React.Fragment>,
    });
  }
}

export default Energy;
