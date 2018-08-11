import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

import ArcaneFamiliar from '../Features/ArcaneFamiliar';
import ArcaneOrb from '../Features/ArcaneOrb';
import ArcanePower from '../Features/ArcanePower';
import RuleOfThrees from '../Features/RuleOfThrees';
import TimeAnomaly from '../Features/TimeAnomaly';
import AlwaysBeCasting from '../Features/AlwaysBeCasting';
import ManaValues from '../ManaChart/ManaValues';
import ArcaneIntellect from '../../../Shared/Modules/Features/ArcaneIntellect';
import CancelledCasts from '../../../Shared/Modules/Features/CancelledCasts';
import MirrorImage from '../../../Shared/Modules/Features/MirrorImage';
import RuneOfPower from '../../../Shared/Modules/Features/RuneOfPower';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    arcaneFamiliar: ArcaneFamiliar,
    arcaneOrb: ArcaneOrb,
    arcanePower: ArcanePower,
    ruleOfThrees: RuleOfThrees,
    timeAnomaly: TimeAnomaly,
    manaValues: ManaValues,
    arcaneIntellect: ArcaneIntellect,
    cancelledCasts: CancelledCasts,
    mirrorImage: MirrorImage,
    runeOfPower: RuneOfPower,
    alwaysBeCasting: AlwaysBeCasting,
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
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          arcaneFamiliarUptime: this.arcaneFamiliar.suggestionThresholds,
          arcaneOrbAverageHits: this.arcaneOrb.averageHitThresholds,
          arcanePowerCooldown: this.arcanePower.cooldownSuggestionThresholds,
          arcanePowerManaUtilization: this.arcanePower.manaUtilizationThresholds,
          arcanePowerCasts: this.arcanePower.castSuggestionThresholds,
          arcanePowerOnKill: this.arcanePower.arcanePowerOnKillSuggestionThresholds,
          ruleOfThreesUsage: this.ruleOfThrees.suggestionThresholds,
          timeAnomalyManaUtilization: this.timeAnomaly.manaUtilizationThresholds,
          manaOnKill: this.manaValues.suggestionThresholds,
          arcaneIntellectUptime: this.arcaneIntellect.suggestionThresholds,
          cancelledCasts: this.cancelledCasts.suggestionThresholds,
          runeOfPowerBuffUptime: this.runeOfPower.roundedSecondsSuggestionThresholds,
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