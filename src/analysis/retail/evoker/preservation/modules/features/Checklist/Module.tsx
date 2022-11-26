import DreamBreath from '../../talents/DreamBreath';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import Combatants from 'parser/shared/modules/Combatants';
import ManaValues from 'parser/shared/modules/ManaValues';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Component from './Component';
import EssenceDetails from '../EssenceDetails';
import EssenceBurst from '../../talents/EssenceBurst';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    dreamBreath: DreamBreath,
    essenceDetails: EssenceDetails,
    essenceBurst: EssenceBurst,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected dreamBreath!: DreamBreath;
  protected essenceBurst!: EssenceBurst;
  protected essenceDetails!: EssenceDetails;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          dreamBreath: this.dreamBreath.suggestionThresholds,
          essenceDetails: this.essenceDetails.suggestionThresholds,
          essenceBurst: this.essenceBurst.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
