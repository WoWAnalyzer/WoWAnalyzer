import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';
import ITEMS from 'common/ITEMS';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

// Buffs-Debuffs
import SpiritBombFrailtyDebuff from '../Talents/SpiritBombFrailtyDebuff';
import VoidReaverDebuff from '../Talents/VoidReaverDebuff';

// Talents
import SpiritBombSoulConsume from '../Talents/SpiritBombSoulConsume';

import AlwaysBeCasting from './AlwaysBeCasting';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    legendaryCountChecker: LegendaryCountChecker,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    prePotion: PrePotion,
    alwaysBeCasting: AlwaysBeCasting,
    enchantChecker: EnchantChecker,

    // Buffs-Debuffs
    spiritBombFrailtyDebuff: SpiritBombFrailtyDebuff,
    voidReaverDebuff: VoidReaverDebuff,

    // Talents
    spiritBombSoulConsume: SpiritBombSoulConsume,

  };

  rules = [
    new Rule({
      name: 'Use your short cooldowns',
      description: 'These should generally always be recharging to maximize efficiency.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.IMMOLATION_AURA,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FRACTURE_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.FRACTURE_TALENT.id),
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SIGIL_OF_FLAME_CONCENTRATED,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FELBLADE_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FEL_DEVASTATION_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.FEL_DEVASTATION_TALENT.id),
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your short defensive/healing cooldowns',
      description: 'Use these to block damage spikes and keep damage smooth to reduce external healing required.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEMON_SPIKES,
            onlyWithSuggestion: false,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.SPIRIT_BOMB_TALENT.id} /> +4 souls casts</React.Fragment>,
            when: this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id),
            check: () => this.spiritBombSoulConsume.suggestionThresholds,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your long defensive cooldowns',
      description: 'Use these to block damage spikes and keep damage smooth to reduce external healing required.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FIERY_BRAND,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.METAMORPHOSIS_TANK,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Maintain your buffs and debuffs',
      description: 'It is important to maintain these as they contribute a large amount to your DPS and HPS.',
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.VOID_REAVER_DEBUFF.id} /> Uptime</React.Fragment>,
            when: this.selectedCombatant.hasTalent(SPELLS.VOID_REAVER_TALENT.id),
            check: () => this.voidReaverDebuff.uptimeSuggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.FRAILTY_SPIRIT_BOMB_DEBUFF.id} /> Uptime</React.Fragment>,
            when: this.selectedCombatant.hasTalent(SPELLS.SPIRIT_BOMB_TALENT.id),
            check: () => this.spiritBombFrailtyDebuff.uptimeSuggestionThresholds,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Important Items',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            name: <React.Fragment><ItemLink id={ITEMS.ARCHIMONDES_HATRED_REBORN.id} /> usage</React.Fragment>,
            spell: SPELLS.ARCHIMONDES_HATRED_REBORN_ABSORB,
            when: this.selectedCombatant.hasTrinket(ITEMS.ARCHIMONDES_HATRED_REBORN.id),
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),

    new PreparationRule(),
  ]
}

export default Checklist;
