import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import Combatants from 'parser/shared/modules/Combatants';
import BaseChecklist from 'parser/shared/modules/features/Checklist/Module';
import ManaValues from 'parser/shared/modules/ManaValues';
import PreparationRuleAnalyzer from 'parser/tbc/modules/features/Checklist/PreparationRuleAnalyzer';
import CombatPotionChecker from 'parser/tbc/modules/items/CombatPotionChecker';
import React from 'react';

import AlwaysBeCasting from '../features/AlwaysBeCasting';
import PrayerOfMending from '../spells/PrayerOfMending';
import Component from './Component';

class Checklist extends BaseChecklist {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    manaValues: ManaValues,
    alwaysBeCasting: AlwaysBeCasting,
    prayerOfMending: PrayerOfMending,
    preparationRuleAnalyzer: PreparationRuleAnalyzer,
    combatPotionChecker: CombatPotionChecker,
  };

  protected combatants!: Combatants;
  protected castEfficiency!: CastEfficiency;
  protected preparationRuleAnalyzer!: PreparationRuleAnalyzer;
  protected prayerOfMending!: PrayerOfMending;
  protected manaValues!: ManaValues;
  protected alwaysBeCasting!: AlwaysBeCasting;
  protected combatPotionChecker!: CombatPotionChecker;

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          ...this.preparationRuleAnalyzer.thresholds,

          prayerOfMending: this.prayerOfMending.prayerOfMendingThreshold,
          manaLeft: this.manaValues.suggestionThresholds,
          nonHealingTimeSuggestionThresholds:
            this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
        }}
      />
    );
  }
}

export default Checklist;
