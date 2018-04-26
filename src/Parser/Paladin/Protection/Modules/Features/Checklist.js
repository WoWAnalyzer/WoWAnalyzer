import SPELLS from 'common/SPELLS';

import CoreChecklist, { Rule } from 'Parser/Core/Modules/Features/Checklist';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import Abilities from 'Parser/Core/Modules/Abilities';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    combatants: Combatants,
    legendaryCountChecker: LegendaryCountChecker,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
  };

  rules = [
    new Rule({
      name: 'Use your rotational spells',
      description: 'These should generally always be recharging to maximize efficiency.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BLESSED_HAMMER_TALENT,
            when: this.combatants.selected.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HAMMER_OF_THE_RIGHTEOUS,
            when: this.combatants.selected.hasTalent(SPELLS.HOLY_SHIELD_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.AVENGERS_SHIELD,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.JUDGMENT_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CONSECRATION_CAST,
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
            spell: SPELLS.AVENGING_WRATH,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SERAPHIM_TALENT,
            when: this.combatants.selected.hasTalent(SPELLS.SERAPHIM_TALENT.id),
          }),
        ];
      },
    }),

    new Rule({
      name: 'Use your defensive cooldowns',
      description: 'Use these to mitigate damage spikes and keep damage smooth to reduce external healing required.',
      requirements: () => {
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HAND_OF_THE_PROTECTOR_TALENT,
            when: this.combatants.selected.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LIGHT_OF_THE_PROTECTOR,
            when: !this.combatants.selected.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EYE_OF_TYR,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ARDENT_DEFENDER,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.GUARDIAN_OF_ANCIENT_KINGS,
          }),
        ];
      },
    }),

    new PreparationRule(),
  ]
}

export default Checklist;
