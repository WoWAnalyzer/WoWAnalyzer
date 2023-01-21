import DreamBreath from '../../talents/DreamBreath';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import Combatants from 'parser/shared/modules/Combatants';
import ManaValues from 'parser/shared/modules/ManaValues';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Component from './Component';
import EssenceDetails from '../EssenceDetails';
import EssenceBurst from '../../talents/EssenceBurst';
import EmeraldBlossom from '../../talents/EmeraldBlossom';
import DreamFlight from '../../talents/DreamFlight';
import Echo from '../../talents/Echo';
import CallOfYsera from '../../talents/CallOfYsera';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    callOfYsera: CallOfYsera,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    dreamBreath: DreamBreath,
    dreamFlight: DreamFlight,
    essenceDetails: EssenceDetails,
    essenceBurst: EssenceBurst,
    emeraldBlossom: EmeraldBlossom,
    echo: Echo,
  };

  protected callOfYsera!: CallOfYsera;
  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected dreamBreath!: DreamBreath;
  protected dreamFlight!: DreamFlight;
  protected emeraldBlossom!: EmeraldBlossom;
  protected echo!: Echo;
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
          callOfYsera: this.callOfYsera.badCastsThresholds,
          dreamBreath: this.dreamBreath.suggestionThresholds,
          dreamFlight: this.dreamFlight.suggestionThresholds,
          echo: this.echo.suggestionThresholds,
          emeraldBlossom: this.emeraldBlossom.suggestionThresholds,
          essenceDetails: this.essenceDetails.suggestionThresholds,
          essenceBurst: this.essenceBurst.suggestionThresholds,
          essenceBurstBuffApplies: this.essenceBurst.buffApplyThreshold,
        }}
      />
    );
  }
}

export default Checklist;
