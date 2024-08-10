import PreparationRuleAnalyzer from 'parser/retail/modules/features/Checklist/PreparationRuleAnalyzer';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';

import SoulShardDetails from '../resources/SoulShardDetails';
import SoulShardTracker from '../resources/SoulShardTracker';
import Haunt from '../spells/Haunt';
import ShadowEmbrace from '../spells/ShadowEmbrace';
import SiphonLife from '../spells/SiphonLife';
import AlwaysBeCasting from '../features/AlwaysBeCasting';
import Agony from '../spells/Agony';
import Corruption from '../spells/Corruption';
import UnstableAffliction from '../spells/UnstableAffliction';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    agonyUptime: Agony,
    alwaysBeCasting: AlwaysBeCasting,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    corruptionUptime: Corruption,
    haunt: Haunt,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    shadowEmbrace: ShadowEmbrace,
    soulShardDetails: SoulShardDetails,
    soulShardTracker: SoulShardTracker,
    unstableAfflictionUptime: UnstableAffliction,
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
  protected agonyUptime!: Agony;
  protected corruptionUptime!: Corruption;
  protected siphonLifeUptime!: SiphonLife;
  protected unstableAfflictionUptime!: UnstableAffliction;

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
          haunt: this.haunt.suggestionThresholds,
          shadowEmbrace: this.shadowEmbrace.suggestionThresholds,
          soulShardDetails: this.soulShardDetails.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
