import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import CoreChecklist, { Rule } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';

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
      name: 'Maintain your buffs and debuffs',
      description: 'It is important to maintain these as they contribute a large amount to your DPS and HPS.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SIGIL_OF_FLAME_CONCENTRATED,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DEMON_SPIKES,
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your defensive cooldowns',
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
          new GenericCastEfficiencyRequirement({
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
