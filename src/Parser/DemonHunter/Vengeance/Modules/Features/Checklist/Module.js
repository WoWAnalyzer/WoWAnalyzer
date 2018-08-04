import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

// Buffs-Debuffs
import SpiritBombFrailtyDebuff from '../../Talents/SpiritBombFrailtyDebuff';
import VoidReaverDebuff from '../../Talents/VoidReaverDebuff';

// Talents
import SpiritBombSoulConsume from '../../Talents/SpiritBombSoulConsume';
import SoulBarrier from '../../Talents/SoulBarrier';

//Spells
import SoulCleaveSoulsConsumed from '../../Spells/SoulCleaveSoulsConsumed';

// Resources
import PainDetails from '../../Pain/PainDetails';
import SoulsOvercap from '../../Statistics/SoulsOvercap';

import AlwaysBeCasting from '../AlwaysBeCasting';

import Component from './Component';

class Checklist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,

    // Buffs-Debuffs
    spiritBombFrailtyDebuff: SpiritBombFrailtyDebuff,
    voidReaverDebuff: VoidReaverDebuff,

    // Talents
    spiritBombSoulConsume: SpiritBombSoulConsume,
    soulBarrier: SoulBarrier,

    // Spells
    soulCleaveSoulsConsumed: SoulCleaveSoulsConsumed,

    // Resources
    painDetails: PainDetails,
    soulsOvercap: SoulsOvercap,

  };

  render() {
    return (
      <Component
        combatant={this.combatants.selected}
        castEfficiency={this.castEfficiency}
        thresholds={{
          downtimeSuggestionThresholds: this.alwaysBeCasting.downtimeSuggestionThresholds,
          spiritBombFrailtyDebuff: this.spiritBombFrailtyDebuff.uptimeSuggestionThresholds,
          voidReaverDebuff: this.voidReaverDebuff.uptimeSuggestionThresholds,
          spiritBombSoulConsume: this.spiritBombSoulConsume.suggestionThresholdsEfficiency,
          soulBarrier: this.soulBarrier.suggestionThresholdsEfficiency,
          soulCleaveSoulsConsumed: this.soulCleaveSoulsConsumed.suggestionThresholdsEfficiency,
          painDetails: this.painDetails.suggestionThresholds,
          soulsOvercap: this.soulsOvercap.suggestionThresholdsEfficiency,
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
