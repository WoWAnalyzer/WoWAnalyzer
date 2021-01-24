import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import { FocusDetails, FocusCapTracker, CancelledCasts } from '@wowanalyzer/hunter';
import SteadyFocus from '@wowanalyzer/hunter-marksmanship/src/modules/talents/SteadyFocus';
import LethalShots from '@wowanalyzer/hunter-marksmanship/src/modules/talents/LethalShots';
import SerpentSting from '@wowanalyzer/hunter-marksmanship/src/modules/talents/SerpentSting';
import CallingTheShots from '@wowanalyzer/hunter-marksmanship/src/modules/talents/CallingTheShots';
import DeadEye from '@wowanalyzer/hunter-marksmanship/src/modules/talents/DeadEye';
import PreciseShots from '@wowanalyzer/hunter-marksmanship/src/modules/spells/PreciseShots';

import Component from './Component';
import AlwaysBeCasting from '../features/AlwaysBeCasting';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,

    //region Core
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    cancelledCasts: CancelledCasts,
    //endregion

    //region Spells
    preciseShots: PreciseShots,
    //endregion

    //region Talents
    steadyFocus: SteadyFocus,
    lethalShots: LethalShots,
    serpentSting: SerpentSting,
    callingTheShots: CallingTheShots,
    deadEye: DeadEye,
    //endregion

    //region Resources
    focusGeneratorDetails: FocusDetails,
    focusCapTracker: FocusCapTracker,
    //endregion
  };

  //region Core
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected cancelledCasts!: CancelledCasts;
  //endregion

  //region Spells
  protected preciseShots!: PreciseShots;
  //endregion

  //region Talents
  protected steadyFocus!: SteadyFocus;
  protected lethalShots!: LethalShots;
  protected serpentSting!: SerpentSting;
  protected callingTheShots!: CallingTheShots;
  protected deadEye!: DeadEye;
  //endregion

  //region Resources
  protected focusGeneratorDetails!: FocusDetails;
  protected focusCapTracker!: FocusCapTracker;

  //endregion

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          //region Core
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.suggestionThresholds,
          cancelledCastsThresholds: this.cancelledCasts.suggestionThresholds,
          //endregion

          //region Spells
          preciseShotsThresholds: this.preciseShots.preciseShotsWastedThreshold,
          //endregion

          //region Talents
          steadyFocusThresholds: this.steadyFocus.uptimeThresholds,
          lethalShotsThresholds: this.lethalShots.wastedPotentialCDR,
          serpentStingUptimeThresholds: this.serpentSting.uptimeThreshold,
          serpentStingNonPandemicThresholds: this.serpentSting.nonPandemicThreshold,
          deadEyeThresholds: this.deadEye.deadEyeEfficacyThresholds,
          callingTheShotsThresholds: this.callingTheShots.callingTheShotsEfficacyThresholds,
          //endregion

          //region Resources
          focusGeneratorWasteThresholds: this.focusGeneratorDetails.focusGeneratorWasteThresholds,
          focusNaturalRegenWasteThresholds: this.focusCapTracker.focusNaturalRegenWasteThresholds,
          //endregion
        }}
      />
    );
  }
}

export default Checklist;
