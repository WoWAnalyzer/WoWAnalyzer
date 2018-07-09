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

import MasteryEffectiveness from '../MasteryEffectiveness';
import AlwaysBeCasting from '../AlwaysBeCasting';
import BeaconHealing from '../../PaladinCore/BeaconHealing';
import FillerLightOfTheMartyrs from '../../PaladinCore/FillerLightOfTheMartyrs';
import FillerFlashOfLight from '../../PaladinCore/FillerFlashOfLight';
import Overhealing from '../../PaladinCore/Overhealing';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    masteryEffectiveness: MasteryEffectiveness,
    alwaysBeCasting: AlwaysBeCasting,
    beaconHealing: BeaconHealing,
    fillerLightOfTheMartyrs: FillerLightOfTheMartyrs,
    fillerFlashOfLight: FillerFlashOfLight,
    manaValues: ManaValues,
    velensFutureSight: VelensFutureSight,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    overhealing: Overhealing,
    enchantChecker: EnchantChecker,
  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          fillerFlashOfLight: this.fillerFlashOfLight.suggestionThresholds,
          masteryEffectiveness: this.masteryEffectiveness.suggestionThresholds,
          nonHealingTimeSuggestionThresholds: this.alwaysBeCasting.nonHealingTimeSuggestionThresholds,
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          beaconHealing: this.beaconHealing.suggestionThresholds,
          fillerLightOfTheMartyrsCpm: this.fillerLightOfTheMartyrs.cpmSuggestionThresholds,
          fillerLightOfTheMartyrsInefficientCpm: this.fillerLightOfTheMartyrs.inefficientCpmSuggestionThresholds,
          manaLeft: this.manaValues.suggestionThresholds,
          overhealing: {
            holyShock: this.overhealing.holyShockSuggestionThresholds,
            lightOfDawn: this.overhealing.lightOfDawnSuggestionThresholds,
            flashOfLight: this.overhealing.flashOfLightSuggestionThresholds,
            bestowFaith: this.overhealing.bestowFaithSuggestionThresholds,
          },
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
