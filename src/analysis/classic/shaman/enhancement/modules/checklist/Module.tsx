// Core
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import Component from './Component';
// Shared
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import CombatPotionChecker from 'parser/classic/modules/items/CombatPotionChecker';
import PreparationRuleAnalyzer from 'parser/classic/modules/features/Checklist/PreparationRuleAnalyzer';
import { TotemTracker } from 'analysis/classic/shaman/shared';
import {
  AirTotems,
  EarthTotems,
  FireTotems,
  WaterTotems,
} from 'analysis/classic/shaman/shared/totems';
// Features
import AlwaysBeCasting from '../features/AlwaysBeCasting';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    // Shared
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    combatPotionChecker: CombatPotionChecker,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    totemTracker: TotemTracker,
    airtotems: AirTotems,
    earthTotems: EarthTotems,
    fireTotems: FireTotems,
    waterTotems: WaterTotems,
    // Features
    alwaysBeCasting: AlwaysBeCasting,
  };

  // Shared
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected combatPotionChecker!: CombatPotionChecker;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected totemTracker!: TotemTracker;
  protected airtotems!: AirTotems;
  protected earthTotems!: EarthTotems;
  protected fireTotems!: FireTotems;
  protected waterTotems!: WaterTotems;
  // Features
  protected alwaysBeCasting!: AlwaysBeCasting;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        totemTracker={this.totemTracker}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          // Shared
          airTotemUptime: this.airtotems.suggestionThreshold,
          earthTotemUptime: this.earthTotems.suggestionThreshold,
          fireTotemUptime: this.fireTotems.suggestionThreshold,
          waterTotemUptime: this.waterTotems.suggestionThreshold,
        }}
      />
    );
  }
}

export default Checklist;
