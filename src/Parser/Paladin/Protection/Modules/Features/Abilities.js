//import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
//import SpellLink from 'common/SpellLink';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    {
      spell: SPELLS.CONSECRATION_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 9 / (1 + haste),
      recommendedCastEfficiency: 0.9,
	},
	  // work on CD
    {
      spell: SPELLS.BLESSED_HAMMER_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 4.5 / (1 + haste),
      charges: 3,
      isActive: combatant => combatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT.id),
      recommendedCastEfficiency: 0.9,
	},
	  // Probably useless to try to count the number of casts
    {
      spell: SPELLS.HAND_OF_THE_PROTECTOR_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.HAND_OF_THE_PROTECTOR_TALENT.id),
      recommendedCastEfficiency: 0.6,
      importance: ISSUE_IMPORTANCE.MINOR,
	},
	  // Probably useless to try to count the number of casts
    {
      spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      charges: 3,
      recommendedCastEfficiency: 0.8,
	},
	  //COOLDOWNS
    {
      spell: SPELLS.EYE_OF_TYR,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => (combatant.hasShoulder(ITEMS.PILLARS_OF_INMOST_LIGHT.id) ? 45 : 60),
      recommendedCastEfficiency: 0.85,
	},

  ];
}

export default Abilities;
