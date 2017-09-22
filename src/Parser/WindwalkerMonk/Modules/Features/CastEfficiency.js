import SPELLS from 'common/SPELLS';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,

    //Rotation
    {
      spell: SPELLS.RISING_SUN_KICK,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 10,
    },
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
      isActive: combatant => combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH),
      
    },
    
    //TODO: Cooldowns (SEF Charges?)
  ];
}

export default CastEfficiency;
