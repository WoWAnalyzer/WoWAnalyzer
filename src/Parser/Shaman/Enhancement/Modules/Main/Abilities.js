import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    {
      spell: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.DOOM_WINDS,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
    },
    {
      spell: SPELLS.EARTHEN_SPIKE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      isActive: combatant => combatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id),
      getCooldown: haste => 20,
    },
    {
      spell: SPELLS.FERAL_SPIRIT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
    },
    {
      spell: SPELLS.LIGHTNING_BOLT,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.WIND_SHEAR,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null, // 1.5 / (1 + haste)
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ROCKBITER,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.FROSTBRAND,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.FROSTBRAND.id),
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.FLAMETONGUE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.STORMSTRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.LAVA_LASH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.WINDSTRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.CRASH_LIGHTNING,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null, // 1.5 / (1 + haste)
    },
    {
      spell: SPELLS.ASTRAL_SHIFT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FERAL_LUNGE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SPIRIT_WALK,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 60,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;
