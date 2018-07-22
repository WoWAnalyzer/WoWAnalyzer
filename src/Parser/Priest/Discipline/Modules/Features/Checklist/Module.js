import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import ManaValues from 'Parser/Core/Modules/ManaValues';
import VelensFutureSight from 'Parser/Core/Modules/Items/Legion/Legendaries/VelensFutureSight';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import AlwaysBeCasting from '../AlwaysBeCasting';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    manaValues: ManaValues,
    velensFutureSight: VelensFutureSight,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          legendariesEquipped: {
            actual: this.legendaryCountChecker.equipped,
            max: this.legendaryCountChecker.max,
            isLessThan: this.legendaryCountChecker.max,
            style: 'number',
          },
          legendariesUpgraded: {
            actual: this.legendaryUpgradeChecker.upgradedLegendaries.length,
            max: this.legendaryCountChecker.max,
            isLessThan: this.legendaryCountChecker.max,
            style: 'number',
          },
          prePotion: this.prePotion.prePotionSuggestionThresholds,
          secondPotion: this.prePotion.prePotionSuggestionThresholds,
          itemsEnchanted: {
            actual: this.enchantChecker.numEnchantableGear - this.enchantChecker.numSlotsMissingEnchant,
            max: this.enchantChecker.numEnchantableGear,
            isLessThan: this.enchantChecker.numEnchantableGear,
            style: 'number',
          },
          itemsBestEnchanted: {
            // numSlotsMissingMaxEnchant doesn't include items without an enchant at all
            actual: this.enchantChecker.numEnchantableGear - this.enchantChecker.numSlotsMissingEnchant - this.enchantChecker.numSlotsMissingMaxEnchant,
            max: this.enchantChecker.numEnchantableGear,
            isLessThan: this.enchantChecker.numEnchantableGear,
            style: 'number',
          },
        }}
      />
    );
  }
}

export default Checklist;
