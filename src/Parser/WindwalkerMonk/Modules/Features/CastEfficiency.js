import SPELLS from 'common/SPELLS';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.RISING_SUN_KICK,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.BLACKOUT_KICK,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
  ];
}

export default CastEfficiency;
