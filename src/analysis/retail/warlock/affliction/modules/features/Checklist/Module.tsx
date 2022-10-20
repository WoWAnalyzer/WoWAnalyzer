import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import SoulShardDetails from '../../core/SoulShardDetails';
import SoulShardTracker from '../../core/SoulShardTracker';
import Haunt from '../../talents/Haunt';
import ShadowEmbrace from '../../talents/ShadowEmbrace';
import SiphonLifeUptime from '../../talents/SiphonLifeUptime';
import AlwaysBeCasting from '../AlwaysBeCasting';
import AgonyUptime from '../DotUptimes/AgonyUptime';
import CorruptionUptime from '../DotUptimes/CorruptionUptime';
import UnstableAfflictionUptime from '../DotUptimes/UnstableAfflictionUptime';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    agonyUptime: AgonyUptime,
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    corruptionUptime: CorruptionUptime,
    haunt: Haunt,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    shadowEmbrace: ShadowEmbrace,
    siphonLifeUptime: SiphonLifeUptime,
    soulShardDetails: SoulShardDetails,
    soulShardTracker: SoulShardTracker,
    unstableAfflictionUptime: UnstableAfflictionUptime,
  };

  // Core
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;

  // Spells
  protected haunt!: Haunt;
  protected shadowEmbrace!: ShadowEmbrace;

  // DoT Uptimes
  protected agonyUptime!: AgonyUptime;
  protected corruptionUptime!: CorruptionUptime;
  protected siphonLifeUptime!: SiphonLifeUptime;
  protected unstableAfflictionUptime!: UnstableAfflictionUptime;


  // Resources
  protected soulShardDetails!: SoulShardDetails;

  render() {
    return (
      <Component
        castEfficiency={this.castEfficiency}
        combatant={this.combatants.selected}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          agony: this.agonyUptime.suggestionThresholds,
          corruption: this.corruptionUptime.suggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          unstableAffliction: this.unstableAfflictionUptime.suggestionThresholds,
          siphonLife: this.siphonLifeUptime.suggestionThresholds,
          haunt: this.haunt.suggestionThresholds,
          shadowEmbrace: this.shadowEmbrace.suggestionThresholds,
          soulShardDetails: this.soulShardDetails.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
