import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import CastEfficiency from 'parser/core/modules/CastEfficiency';
import Combatants from 'parser/core/modules/Combatants';
import ManaValues from 'parser/core/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/core/modules/features/Checklist2/PreparationRuleAnalyzer';

import MasteryEffectiveness from '../MasteryEffectiveness';
import AlwaysBeCasting from '../AlwaysBeCasting';
import DirectBeaconHealing from '../../beacons/DirectBeaconHealing';
import FillerLightOfTheMartyrs from '../../core/FillerLightOfTheMartyrs';
import FillerFlashOfLight from '../../core/FillerFlashOfLight';
import Overhealing from '../../core/Overhealing';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    directBeaconHealing: DirectBeaconHealing,
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
          directBeaconHealing: this.directBeaconHealing.suggestionThresholds,
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
