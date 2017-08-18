import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

const SPELL_CATEGORY = {
    ROTATIONAL: 'Rotational Spell',
    COOLDOWNS: 'Cooldown',
};

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    {
      spell: SPELLS.HAUNT,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 25,
      isActive: combatant => combatant.hasTalent(SPELLS.HAUNT_TALENT.id),
      recommendedCastEfficiency: 0.95,
      extraSuggestion: 'This estimate may not be correct sometimes because of Haunt\'s resets. The real amount of possible Haunts will be higher if there were adds on this fight.',
    },
    {
      spell: SPELLS.PHANTOM_SINGULARITY,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => 40,
      isActive: combatant => combatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id),
      recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.SOUL_HARVEST,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id),
    },
    {
      spell: SPELLS.SUMMON_DOOMGUARD_UNTALENTED,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
      recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.SUMMON_INFERNAL_UNTALENTED,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
      recommendedCastEfficiency: 0.95,
    },
  ];

  static SPELL_CATEGORIES = SPELL_CATEGORY;
}

export default CastEfficiency;
