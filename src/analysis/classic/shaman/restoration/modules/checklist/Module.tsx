// Core
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import Component from './Component';
// Shared
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import CombatPotionChecker from 'parser/classic/modules/items/CombatPotionChecker';
import ManaValues from 'parser/shared/modules/ManaValues';
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
// Spells
import ChainHeal from '../spells/ChainHeal';
import EarthShield from '../spells/EarthShield';
import WaterShield from '../spells/WaterShield';

class Checklist extends BaseChecklist {
  static dependencies = {
    ...BaseChecklist.dependencies,
    // Shared
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    combatPotionChecker: CombatPotionChecker,
    manaValues: ManaValues,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    totemTracker: TotemTracker,
    airtotems: AirTotems,
    earthTotems: EarthTotems,
    fireTotems: FireTotems,
    waterTotems: WaterTotems,
    // Features
    alwaysBeCasting: AlwaysBeCasting,
    // Spells
    chainHeal: ChainHeal,
    earthShield: EarthShield,
    waterShield: WaterShield,
  };

  // Shared
  protected castEfficiency!: CastEfficiency;
  protected combatants!: Combatants;
  protected combatPotionChecker!: CombatPotionChecker;
  protected manaValues!: ManaValues;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected totemTracker!: TotemTracker;
  // Features
  protected alwaysBeCasting!: AlwaysBeCasting;
  // Spells
  protected airtotems!: AirTotems;
  protected chainHeal!: ChainHeal;
  protected earthShield!: EarthShield;
  protected earthTotems!: EarthTotems;
  protected fireTotems!: FireTotems;
  protected waterShield!: WaterShield;
  protected waterTotems!: WaterTotems;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        totemTracker={this.totemTracker}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          nonHealingTimeSuggestionThresholds:
            this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          // Shared
          airTotemUptime: this.airtotems.suggestionThreshold,
          earthTotemUptime: this.earthTotems.suggestionThreshold,
          fireTotemUptime: this.fireTotems.suggestionThreshold,
          waterTotemUptime: this.waterTotems.suggestionThreshold,
          // Spells
          chainHealTargetThresholds: this.chainHeal.suggestionThreshold,
          earthShieldPrepull: this.earthShield.suggestionThresholdsPrepull,
          earthShieldUptime: this.earthShield.suggestionThresholds,
          waterShieldPrepull: this.waterShield.suggestionThresholdsPrepull,
          waterShieldUptime: this.waterShield.suggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
