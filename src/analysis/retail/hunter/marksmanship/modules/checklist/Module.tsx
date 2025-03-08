import PreciseShots from 'analysis/retail/hunter/marksmanship/modules/spells/PreciseShots';
import CallingTheShots from 'analysis/retail/hunter/marksmanship/modules/talents/CallingTheShots';
import { FocusDetails, FocusCapTracker, CancelledCasts } from 'analysis/retail/hunter/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import Component from './Component';
import MMTier2P from '../items/MMTier2P';
import MMTier4P from '../items/MMTier4P';

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
    callingTheShots: CallingTheShots,
    //endregion

    //region Resources
    focusGeneratorDetails: FocusDetails,
    focusCapTracker: FocusCapTracker,
    //endregion

    mmTier2P: MMTier2P,
    mmTier4P: MMTier4P,
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
  protected callingTheShots!: CallingTheShots;
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
