import { Judgment, HolyPowerDetails } from 'analysis/retail/paladin/shared';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import ArtOfWar from '../../core/ArtOfWar';
import ShieldOfVengeance from '../../core/ShieldOfVengeance';
import Crusade from '../../talents/Crusade';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    alwaysBeCasting: AlwaysBeCasting,
    holyPowerDetails: HolyPowerDetails,
    artOfWar: ArtOfWar,
    judgment: Judgment,
    crusade: Crusade,
    shieldOfVengeance: ShieldOfVengeance,
  };
  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          alwaysBeCasting: this.alwaysBeCasting.suggestionThresholds,
          holyPowerDetails: this.holyPowerDetails.suggestionThresholds,
          artOfWar: this.artOfWar.suggestionThresholds,
          crusade: this.crusade.suggestionThresholds,
          judgment: this.judgment.suggestionThresholds,
          shieldOfVengeance: this.shieldOfVengeance.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
