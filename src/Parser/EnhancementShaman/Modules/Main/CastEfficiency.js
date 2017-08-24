import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

const SPELL_CATEGORY = {
  ROTATIONAL: 'Spell',
  ROTATIONAL_AOE: 'Spell (AOE)',
  COOLDOWNS: 'Cooldown',
  UTILITY: 'Utility',
};

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    {
      spell: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.DOOM_WINDS,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 60,
    },
    {
      spell: SPELLS.FERAL_SPIRIT,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 120,
    },
    {
      spell: SPELLS.SUMMON_DREAD_REFLECTION,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 45,
      isActive: combatant => combatant.hasTrinket(ITEMS.SPECTER_OF_BETRAYAL.id),
    },
    {
      spell: SPELLS.CEASELESS_TOXIN,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 60,//add detection if target has died and reduced cooldown
      isActive: combatant => combatant.hasTrinket(ITEMS.VIAL_OF_CEASELESS_TOXINS.id),
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.WIND_SHEAR,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.ROCKBITER,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.FROSTBRAND,
      category: SPELL_CATEGORY.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.FROSTBRAND.id),
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.FLAMETONGUE,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.STORMSTRIKE,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.LAVA_LASH,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.WINDSTRIKE,
      category: SPELL_CATEGORY.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.CRASH_LIGHTNING,
      category: SPELL_CATEGORY.ROTATIONAL_AOE,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.ASTRAL_SHIFT,
      category: SPELL_CATEGORY.UTILITY,
      getCooldown: haste => 90,
    },
    {
      spell: SPELLS.FERAL_LUNGE,
      category: SPELL_CATEGORY.UTILITY,
      getCooldown: haste => 30,
    },
    {
      spell: SPELLS.SPIRIT_WALK,
      category: SPELL_CATEGORY.UTILITY,
      getCooldown: haste => 60,
    },
    ...CoreCastEfficiency.CPM_ABILITIES,
  ];
  static SPELL_CATEGORIES = SPELL_CATEGORY;
}

export default CastEfficiency;
