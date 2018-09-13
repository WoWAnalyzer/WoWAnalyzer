import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import PreparationRuleAnalyzer from 'Parser/Core/Modules/Features/Checklist2/PreparationRuleAnalyzer';

import MasteryEffectiveness from '../MasteryEffectiveness';
import AlwaysBeCasting from '../AlwaysBeCasting';
import BeaconHealing from '../../PaladinCore/BeaconHealing';
import FillerLightOfTheMartyrs from '../../PaladinCore/FillerLightOfTheMartyrs';
import FillerFlashOfLight from '../../PaladinCore/FillerFlashOfLight';
import Overhealing from '../../PaladinCore/Overhealing';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    beaconHealing: BeaconHealing,
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,
    fillerFlashOfLight: FillerFlashOfLight,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    overhealing: Overhealing,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          fillerFlashOfLight: this.fillerFlashOfLight.suggestionThresholds,
          masteryEffectiveness: this.masteryEffectiveness.suggestionThresholds,
          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          beaconHealing: this.beaconHealing.suggestionThresholds,
          fillerLightOfTheMartyrsCpm: this.fillerLightOfTheMartyrs.cpmSuggestionThresholds,
          fillerLightOfTheMartyrsInefficientCpm: this.fillerLightOfTheMartyrs.inefficientCpmSuggestionThresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          overhealing: {
            holyShock: this.overhealing.holyShockSuggestionThresholds,
            lightOfDawn: this.overhealing.lightOfDawnSuggestionThresholds,
            flashOfLight: this.overhealing.flashOfLightSuggestionThresholds,
            bestowFaith: this.overhealing.bestowFaithSuggestionThresholds,
          },
        }}
      />
    );
  }
}

export default Checklist;
