import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import resourceSuggest from 'parser/shared/modules/resources/resourcetracker/ResourceSuggest';

import { EnergyTracker, EnergyCapTracker } from '@wowanalyzer/rogue';

class Energy extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
    energyCapTracker: EnergyCapTracker,
  };

  protected energyTracker!: EnergyTracker;
  protected energyCapTracker!: EnergyCapTracker;

  get energyThresholds() {
    return {
      actual: (this.energyTracker.wasted + this.energyCapTracker.missedRegen) / (this.energyTracker.generated + this.energyCapTracker.naturalRegen),
      isGreaterThan: {
        minor: 0.033,
        average: 0.066,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    resourceSuggest(when, this.energyTracker, {
      spell: SPELLS.SYMBOLS_OF_DEATH,
      minor: 0.10,
      avg: 0.20,
      major: 0.50,
      extraSuggestion: <>Try to spend energy before using <SpellLink id={SPELLS.SYMBOLS_OF_DEATH.id} />, but do not delay it to avoid waste! </>,
    });

    resourceSuggest(when, this.energyTracker, {
      spell: SPELLS.RELENTLESS_STRIKES,
      minor: 0.15,
      avg: 0.25,
      major: 0.40,
      extraSuggestion: <> You are wasting more energy then normal. You may be pooling too much energy or not casting enough spenders. </>,
    });
  }
}

export default Energy;
