import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseModule from 'parser/shared/modules/features/Checklist/Module';

import RunicPowerDetails from '../../runicpower/RunicPowerDetails';
import AlwaysBeCasting from '../AlwaysBeCasting';
import RuneTracker from '../RuneTracker';
import Component from './Component';

class Checklist extends BaseModule {
  static dependencies = {
    ...BaseModule.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    runicPowerDetails: RunicPowerDetails,
    runeTracker: RuneTracker,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected runeTracker!: RuneTracker;
  protected runicPowerDetails!: RunicPowerDetails;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          runeEfficiency: this.runeTracker.suggestionThresholdsEfficiency,
          runicPowerEfficiency: this.runicPowerDetails.efficiencySuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
