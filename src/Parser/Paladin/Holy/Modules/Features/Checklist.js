import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import Combatants from 'Parser/Core/Modules/Combatants';

class Rule {}
class Requirement {
  name = null;
  check = null;
  when = null;
  constructor({ name, check, when }) {
    this.name = name;
    this.check = check;
    this.when = when;
  }
}
class GenericCastEfficiencyRequirement extends Requirement {
  constructor({ spell, ...others }) {
    super({
      name: spell.name,
      check: () => {
        const castEfficiency = this.castEfficiency.getAbility(spell.id);
        return castEfficiency.efficiency / castEfficiency.recommendedEfficiency;
      },
      ...others,
    });
  }
}

class Checklist extends Analyzer {
  static dependencies = {
    castEfficiency: CastEfficiency,
    combatants: Combatants,
  };

  static rules = [
    new Rule({
      name: 'Use core spells on cooldown',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.HOLY_SHOCK_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LIGHT_OF_DAWN_CAST,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.JUDGMENT_CAST,
            when: combatant.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id) || combatant.hasRing(ITEMS.ILTERENDI_CROWN_JEWEL_OF_SILVERMOON.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BESTOW_FAITH_TALENT,
            when: combatant.hasTalent(SPELLS.BESTOW_FAITH_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.LIGHTS_HAMMER_TALENT,
            when: combatant.hasTalent(SPELLS.LIGHTS_HAMMER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CRUSADER_STRIKE,
            when: combatant.hasTalent(SPELLS.CRUSADERS_MIGHT_TALENT.id),
          }),
        ];
      },
    }),
  ];
}

export default Checklist;
