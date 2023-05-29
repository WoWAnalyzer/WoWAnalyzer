import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import { apl, check as aplCheck } from '../apl/AplCheck';
import WindfuryTotem from '../talents/WindfuryTotem';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import Component from './Component';
import MaelstromWeaponDetails from '../resourcetracker/MaelstromWeaponDetails';
// import Hailstorm from '../talents/Hailstorm';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    alwaysBeCasting: AlwaysBeCasting,
    windfuryTotem: WindfuryTotem,
    maestromWeaponDetails: MaelstromWeaponDetails,
    // hailstorm: Hailstorm,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected windfuryTotem!: WindfuryTotem;
  //protected hailstorm!: Hailstorm;

  render() {
    const checkResults = aplCheck(this.owner.eventHistory, this.owner.info);
    return (
      <Component
        apl={apl}
        checkResults={checkResults}
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          alwaysBeCasting: this.alwaysBeCasting.suggestionThresholds,
          windfuryTotemUptime: this.windfuryTotem.uptimeThreshold,
        }}
      />
    );
  }
}

export default Checklist;
