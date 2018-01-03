//import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

//import SpellLink from 'common/SpellLink';

class Abilities extends CoreAbilities {
  spellbook() { // TODO: Migrate
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.CONSECRATION_CAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 9 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      // work on CD
      {
        spell: SPELLS.BLESSED_HAMMER_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        charges: 3,
        enabled: combatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.AVENGERS_SHIELD,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      // Probably useless to try to count the number of casts
      {
        spell: SPELLS.HAND_OF_THE_PROTECTOR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      // Probably useless to try to count the number of casts
      //Note by yajinni: Since this is thier main source of damage mitigation, without it they get hit like by a truck.
      //And a main source of damage, it should be tracked somewhat. Keeping it at 80% for now.
      {
        spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 16 / (1 + haste),
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      //COOLDOWNS
      {
        spell: SPELLS.EYE_OF_TYR,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => (combatant.hasShoulder(ITEMS.PILLARS_OF_INMOST_LIGHT.id) ? 45 : 60),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
    ];
  }
}

export default Abilities;
