import { EnergyDetails, ComboPointDetails } from 'analysis/retail/rogue/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import OutlawEnergyCapTracker from '../../core/OutlawEnergyCapTracker';
import Finishers from '../../features/Finishers';
import Audacity from '../../spells/Audacity';
import BetweenTheEyes from '../../spells/BetweenTheEyes';
import Dispatch from '../../spells/Dispatch';
import Opportunity from '../../spells/Opportunity';
import RollTheBonesBuffs from '../../spells/RollTheBonesBuffs';
import RollTheBonesEfficiency from '../../spells/RollTheBonesEfficiency';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    energyDetails: EnergyDetails,
    energyCapTracker: OutlawEnergyCapTracker,
    comboPointDetails: ComboPointDetails,

    finishers: Finishers,
    rollTheBonesBuffs: RollTheBonesBuffs,
    rollTheBonesEfficiency: RollTheBonesEfficiency,
    betweenTheEyes: BetweenTheEyes,
    dispatch: Dispatch,
    opportunity: Opportunity,
    audacity: Audacity,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          energyEfficiency: this.energyDetails.suggestionThresholds,
          energyCapEfficiency: this.energyCapTracker.suggestionThresholds,
          comboPointEfficiency: this.comboPointDetails.suggestionThresholds,

          finishers: this.finishers.suggestionThresholds,
          rollTheBonesBuffs: this.rollTheBonesBuffs.suggestionThresholds,
          betweenTheEyes: this.betweenTheEyes.thresholds,
          dispatch: this.dispatch.thresholds,
          opportunity: this.opportunity.thresholds,
          audacity: this.audacity.thresholds,
        }}
        rtbEfficiencies={this.rollTheBonesEfficiency.rollSuggestions}
      />
    );
  }
}

export default Checklist;
