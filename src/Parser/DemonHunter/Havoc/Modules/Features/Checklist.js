import SPELLS from 'common/SPELLS';

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
            when: this.selectedCombatant.hasTalent(SPELLS.IMMOLATION_AURA_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FELBLADE_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FEL_RUSH,
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
            spell: SPELLS.NEMESIS_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.NEMESIS_TALENT.id),
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.MOMENTUM_TALENT,
            when: this.selectedCombatant.hasTalent(SPELLS.MOMENTUM_TALENT.id),
            onlyWithSuggestion: false,
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your offensive cooldowns',
      description: 'You should aim to use these cooldowns as often as you can to maximize your damage output unless you are saving them for their defensive value.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.METAMORPHOSIS_HAVOC,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EYE_BEAM,
            onlyWithSuggestion: false,
          }),

        ];
      },
    }),

    new PreparationRule(),
  ]
}

export default Checklist;
