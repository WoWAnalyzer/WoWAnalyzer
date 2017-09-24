import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Combatants from 'Parser/Core/Modules/Combatants';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    
    //Rotation
    {
      //TODO: support serenity casts?
  
      spell: SPELLS.RISING_SUN_KICK,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasBuff(SPELLS.MONK_T19_WINDWALKER_2P_BONUS),
      getCooldown: haste => 4 / (1 + haste),
    },
    {
      spell: SPELLS.RISING_SUN_KICK,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => !combatant.hasBuff(SPELLS.MONK_T19_WINDWALKER_2P_BONUS),
      getCooldown: haste => 7 / (1 + haste),
    },
    //TODO: Reduced CD from t20 set (7.3 so ?)
    {
      spell: SPELLS.FISTS_OF_FURY,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 24,
    },
    {
      spell: SPELLS.STRIKE_OF_THE_WINDLORD,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 40,
    },
    {
      spell: SPELLS.WHIRLING_DRAGON_PUNCH,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 24,
      isActive: combatant => combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT),
      
    },
    {
      spell: SPELLS.STORM_EARTH_AND_FIRE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWN,
      getCooldown: haste => 90,
      isActive: combatant => !combatant.hasTalent(SPELLS.SERENITY_TALENT),
      noSuggestion: true,
    }  
  ];
}

export default CastEfficiency;
