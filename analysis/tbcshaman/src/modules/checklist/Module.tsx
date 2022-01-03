import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/tbc/modules/features/Checklist/PreparationRuleAnalyzer';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import ChainHeal from '../spells/ChainHeal';
import EarthShield from '../spells/shields/EarthShield';
import WaterShield from '../spells/shields/WaterShield';
import Component from './Component';
import FireTotems from "../spells/totems/FireTotems";
import WaterTotems from "../spells/totems/WaterTotems";
import EarthTotems from "../spells/totems/EarthTotems";
import AirTotems from "../spells/totems/AirTotems";
import TotemTracker from '../features/TotemTracker';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    alwaysBeCasting: AlwaysBeCasting,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    earthShield: EarthShield,
    waterShield: WaterShield,
    chainHeal: ChainHeal,
    totemTracker: TotemTracker,
    fireTotems: FireTotems,
    waterTotems: WaterTotems,
    earthTotems: EarthTotems,
    airtotems: AirTotems,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected manaValues!: ManaValues;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected earthShield!: EarthShield;
  protected waterShield!: WaterShield;
  protected chainHeal!: ChainHeal;
  protected totemTracker!: TotemTracker;
  protected fireTotems!: FireTotems;
  protected waterTotems!: WaterTotems;
  protected earthTotems!: EarthTotems;
  protected airtotems!: AirTotems;

  render() {
    return (
      <Component
        build={this.owner.build}
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        totemTracker={this.totemTracker}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          manaLeft: this.manaValues.suggestionThresholds,
          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          earthShieldPrepull: this.earthShield.suggestionThresholdsPrepull,
          earthShieldUptime: this.earthShield.suggestionThresholds,
          waterShieldPrepull: this.waterShield.suggestionThresholdsPrepull,
          waterShieldUptime: this.waterShield.suggestionThresholds,
          chainHealTargetThresholds: this.chainHeal.suggestionThreshold,
          fireTotemUptime: this.fireTotems.suggestionThreshold,
          waterTotemUptime: this.waterTotems.suggestionThreshold,
          earthTotemUptime: this.earthTotems.suggestionThreshold,
          airTotemUptime: this.airtotems.suggestionThreshold,
        }}
      />
    );
  }
}

export default Checklist;
