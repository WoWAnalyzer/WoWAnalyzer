import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import SoulShardDetails from '../../soulshards/SoulShardDetails';
import SoulShardTracker from '../../soulshards/SoulShardTracker';
import Eradication from '../../talents/Eradication';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Backdraft from '../../talents/Backdraft';
import ImmolateUptime from '../ImmolateUptime';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,

    immolateUptime: ImmolateUptime,
    backdraft: Backdraft,
    soulShardDetails: SoulShardDetails,
    soulShardTracker: SoulShardTracker,
    eradication: Eradication,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected immolateUptime!: ImmolateUptime;
  protected backdraft!: Backdraft;
  protected soulShardDetails!: SoulShardDetails;
  protected soulShardTracker!: SoulShardTracker;
  protected eradication!: Eradication;

  render() {
    return (
      <Component
        castEfficiency={this.castEfficiency}
        combatant={this.combatants.selected}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          immolate: this.immolateUptime.suggestionThresholds,
          wastedBackdraft: this.backdraft.suggestionThresholds,
          eradication: this.eradication.suggestionThresholds,
          soulShards: this.soulShardDetails.suggestionThresholds,
          downtime: this.alwaysBeCasting.suggestionThresholds,
        }}
        shardTracker={this.soulShardTracker}
      />
    );
  }
}

export default Checklist;
