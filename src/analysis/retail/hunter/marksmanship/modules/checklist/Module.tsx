import PreciseShots from 'analysis/retail/hunter/marksmanship/modules/spells/PreciseShots';
import CallingTheShots from 'analysis/retail/hunter/marksmanship/modules/talents/CallingTheShots';
import DeadEye from 'analysis/retail/hunter/marksmanship/modules/talents/DeadEye';
import LethalShots from 'analysis/retail/hunter/marksmanship/modules/talents/LethalShots';
import SerpentSting from 'analysis/retail/hunter/marksmanship/modules/talents/SerpentSting';
import SteadyFocus from 'analysis/retail/hunter/marksmanship/modules/talents/SteadyFocus';
import { FocusDetails, FocusCapTracker, CancelledCasts } from 'analysis/retail/hunter/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import { apl, check as aplCheck } from '../apl/AplCheck';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
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
    const checkResults = aplCheck(this.owner.eventHistory, this.owner.info);
    return (
      <Component
        apl={apl}
        checkResults={checkResults}
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
