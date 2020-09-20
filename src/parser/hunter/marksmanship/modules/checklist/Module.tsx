import React from 'react';

import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import PreparationRuleAnalyzer from 'parser/shared/modules/features/Checklist/PreparationRuleAnalyzer';
import FocusDetails from 'parser/hunter/shared/modules/resources/FocusDetails';
import FocusCapTracker from 'parser/hunter/shared/modules/resources/FocusCapTracker';
import SteadyFocus from 'parser/hunter/marksmanship/modules/talents/SteadyFocus';
import LethalShots from 'parser/hunter/marksmanship/modules/talents/LethalShots';
import HuntersMark from 'parser/hunter/shared/modules/spells/HuntersMark';
import SerpentSting from 'parser/hunter/marksmanship/modules/talents/SerpentSting';

import Component from './Component';
import AlwaysBeCasting from '../features/AlwaysBeCasting';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,

    //region Core
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    //endregion

    //region Spells
    huntersMark: HuntersMark,
    //endregion

    //region Talents
    steadyFocus: SteadyFocus,
    lethalShots: LethalShots,
    serpentSting: SerpentSting,
    //endregion

    //region Resources
    focusGeneratorDetails: FocusDetails,
    focusCapTracker: FocusCapTracker,
    //endregion
  };

  protected combatants!: Combatants;

  //region Core
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  //endregion

  //region Spells
  protected huntersMark!: HuntersMark;
  //endregion

  //region Talents
  protected steadyFocus!: SteadyFocus;
  protected lethalShots!: LethalShots;
  protected serpentSting!: SerpentSting;
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
          //endregion

          //region Spells
          huntersMarkThresholds: this.huntersMark.uptimeThresholds,
          //endregion

          //region Talents
          steadyFocusThresholds: this.steadyFocus.uptimeThresholds,
          lethalShotsThresholds: this.lethalShots.wastedPotentialCDR,
          serpentStingUptimeThresholds: this.serpentSting.uptimeThreshold,
          serpentStingNonPandemicThresholds: this.serpentSting.nonPandemicThreshold,
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
