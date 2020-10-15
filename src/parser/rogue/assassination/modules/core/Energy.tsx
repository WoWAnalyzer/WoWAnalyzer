import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';
import { When } from 'parser/core/ParseResults';

import EnergyTracker from '../../../shared/resources/EnergyTracker';

class Energy extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };
  protected energyTracker!: EnergyTracker

  // TODO: Urge to kill (vendetta energy regen) currently missing from WCL events. Needs a fix.
  suggestions(when: When) {
    resourceSuggest(when, this.energyTracker, {
      spell: SPELLS.URGE_TO_KILL,
      minor: 0.05,
      avg: 0.1,
      major: 0.15,
      extraSuggestion: <>Try to spend energy before using <SpellLink id={SPELLS.VENDETTA.id} /> </>,
    });
  }
}

export default Energy;
