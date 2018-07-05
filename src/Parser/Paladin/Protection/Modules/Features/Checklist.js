import React from 'react';

import SPELLS from 'common/SPELLS';

import SpellLink from 'common/SpellLink';

import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import Abilities from 'Parser/Core/Modules/Abilities';
import ShieldOfTheRighteous from './ShieldOfTheRighteous';
import Consecration from './Consecration';

class Checklist extends CoreChecklist {
  static dependencies = {
    abilities: Abilities,
    castEfficiency: CastEfficiency,
    legendaryCountChecker: LegendaryCountChecker,
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,
    shieldOfTheRighteous: ShieldOfTheRighteous,
    consecration: Consecration,
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
            when: this.selectedCombatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HAMMER_OF_THE_RIGHTEOUS,
            when: !this.selectedCombatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.AVENGERS_SHIELD,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.JUDGMENT_CAST_PROTECTION,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CONSECRATION_CAST,
          }),
        ];
      },
    }),

    new Rule({
      name: (
        <React.Fragment>
          Mitigate incoming damage with <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> and <SpellLink id={SPELLS.CONSECRATION_CAST.id} />
        </React.Fragment> 
      ),
      description: (
        <React.Fragment>
          Maintain <SpellLink id={SPELLS.CONSECRATION_CAST.id} /> to reduce all incoming damage by a flat amount and use it as a rotational filler if necessary.<br/>
          Use <SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> to flat out your physical damage taken or weave them into your rotation when you're about to cap charges.
        </React.Fragment>
      ),
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.SHIELD_OF_THE_RIGHTEOUS.id} /> efficiency</React.Fragment>,
            check: () => this.shieldOfTheRighteous.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.CONSECRATION_CAST.id} /> uptime</React.Fragment>,
            check: () => this.consecration.uptimeSuggestionThresholds,
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
            when: this.selectedCombatant.hasTalent(SPELLS.SERAPHIM_TALENT.id),
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
            when: this.selectedCombatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LIGHT_OF_THE_PROTECTOR,
            when: !this.selectedCombatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
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
