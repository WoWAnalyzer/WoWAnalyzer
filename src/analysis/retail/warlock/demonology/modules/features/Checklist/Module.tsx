import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import SoulShardDetails from '../../resources/SoulShardDetails';
import SoulShardTracker from '../../resources/SoulShardTracker';
import Doom from '../../talents/Doom';
import FelCovenant from '../../talents/FelCovenant';
import AlwaysBeCasting from '../AlwaysBeCasting';
import Felstorm from '../Felstorm';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    doom: Doom,
    felCovenant: FelCovenant,
    felstorm: Felstorm,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    soulShardDetails: SoulShardDetails,
    soulShardTracker: SoulShardTracker,
  };

  protected alwaysBeCasting!: AlwaysBeCasting;
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;

  // Buffs
  protected felCovenant!: FelCovenant;

  // Spells
  protected doom!: Doom;
  protected felstorm!: Felstorm;

  // Resources
  protected soulShardDetails!: SoulShardDetails;

  render() {
    return (
      <Component
        castEfficiency={this.castEfficiency}
        combatant={this.combatants.selected}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          doom: this.doom.suggestionThresholds,
          felCovenant: this.felCovenant.uptimeThreshold,
          felstorm: this.felstorm.suggestionThresholds,
          soulShards: this.soulShardDetails.suggestionThresholds,
          downtime: this.alwaysBeCasting.suggestionThresholds,
          soulShardDetails: this.soulShardDetails.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
