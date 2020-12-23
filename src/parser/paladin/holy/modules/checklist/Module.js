import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';

import MasteryEffectiveness from '../features/MasteryEffectiveness';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import DirectBeaconHealing from '../beacons/DirectBeaconHealing';
import BeaconUptime from '../beacons/BeaconUptime';
import FillerLightOfTheMartyrs from '../spells/FillerLightOfTheMartyrs';
import FillerFlashOfLight from '../spells/FillerFlashOfLight';

import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    directBeaconHealing: DirectBeaconHealing,
    beaconUptime: BeaconUptime,
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,
    fillerFlashOfLight: FillerFlashOfLight,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        owner={this.owner}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          fillerFlashOfLight: this.fillerFlashOfLight.suggestionThresholds,
          masteryEffectiveness: this.masteryEffectiveness.suggestionThresholds,
          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          directBeaconHealing: this.directBeaconHealing.suggestionThresholds,
          beaconUptimeBoL: this.beaconUptime.suggestionThresholdsBoL,
          beaconUptimeBoLUptime: this.beaconUptime.suggestionThresholdsBoLUptime,
          beaconUptimeBoF: this.beaconUptime.suggestionThresholdsBoF,
          beaconUptimeBoFUptime: this.beaconUptime.suggestionThresholdsBoFUptime,
          fillerLightOfTheMartyrsCpm: this.fillerLightOfTheMartyrs.cpmSuggestionThresholds,
          fillerLightOfTheMartyrsInefficientCpm: this.fillerLightOfTheMartyrs.inefficientCpmSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
