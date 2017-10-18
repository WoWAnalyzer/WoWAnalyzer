import SPELLS from 'common/SPELLS';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.VANISH,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.SHADOW_BLADES, // TODO: Reduced by Convergence of Fates
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.SYMBOLS_OF_DEATH,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30, // TODO: Add T20 4Sets, reduce cd by 5 sec.
      recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.SHADOW_DANCE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60, // TODO: Reduced by a passive.
      charges: 2,
      recommendedCastEfficiency: 0.95,
    },
  ];
}

export default CastEfficiency;
