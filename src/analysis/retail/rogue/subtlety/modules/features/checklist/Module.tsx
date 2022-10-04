import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

//Core

//Base
import CastsInShadowDance from '../../core/CastsInShadowDance';
import CastsInStealth from '../../core/CastsInStealth';
import ComboPoints from '../../core/ComboPoints';
import Energy from '../../core/Energy';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    //Core
    comboPoints: ComboPoints,
    energy: Energy,

    //Base
    castsInShadowDance: CastsInShadowDance,
    castsInStealth: CastsInStealth,
  };

  //region Core
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected comboPoints!: ComboPoints;
  protected energy!: Energy;
  //endregion

  //region Base
  protected castsInShadowDance!: CastsInShadowDance;
  protected castsInStealth!: CastsInStealth;

  //endregion

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          //Core
          comboPoints: this.comboPoints.comboPointThresholds,
          energy: this.energy.energyThresholds,

          //Base
          castsInShadowDance: this.castsInShadowDance.castsInStealthThresholds,
          backstabInShadowDance: this.castsInShadowDance.danceBackstabThresholds,
          castsInStealth: this.castsInStealth.castsInStealthThresholds,
          backstabInStealth: this.castsInStealth.stealthBackstabThresholds,
        }}
      />
    );
  }
}

export default Checklist;
