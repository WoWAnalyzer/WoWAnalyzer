import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/tbc/modules/features/Checklist/PreparationRuleAnalyzer';
import React from 'react';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import ChainHeal from '../spells/ChainHeal';
import EarthShield from '../spells/EarthShield';
import WaterShield from '../spells/WaterShield';
import Component from './Component';

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
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected manaValues!: ManaValues;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected earthShield!: EarthShield;
  protected waterShield!: WaterShield;
  protected chainHeal!: ChainHeal;

  render() {
    return (
      <Component
        build={this.owner.build}
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          manaLeft: this.manaValues.suggestionThresholds,
          nonHealingTimeSuggestionThresholds:
            this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          earthShieldPrepull: this.earthShield.suggestionThresholdsPrepull,
          earthShieldUptime: this.earthShield.suggestionThresholds,
          waterShieldPrepull: this.waterShield.suggestionThresholdsPrepull,
          waterShieldUptime: this.waterShield.suggestionThresholds,
          chainHealTargetThresholds: this.chainHeal.suggestionThreshold,
        }}
      />
    );
  }
}

export default Checklist;
