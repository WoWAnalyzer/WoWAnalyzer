import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    {
      spell: SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id),
      recommendedEfficiency: 1.0,
    },
    {
      spell: SPELLS.TIGERS_FURY,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
    },
    {
      spell: SPELLS.ASHAMANES_FRENZY,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 75,
    },
    {
      spell: SPELLS.ELUNES_GUIDANCE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      isActive: combatant => combatant.hasTalent(SPELLS.ELUNES_GUIDANCE_TALENT.id),
      getCooldown: haste => 30,
    },
    {
      spell: SPELLS.RAKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.RIP,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SHRED,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.REGROWTH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.FEROCIOUS_BITE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SAVAGE_ROAR_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id),
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.MOONFIRE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id),
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.BRUTAL_SLASH_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasTalent(SPELLS.BRUTAL_SLASH_TALENT.id),
      getCooldown: haste => 12,
    },
    {
      spell: SPELLS.THRASH_BEAR,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.MAIM,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 10,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CAT_SWIPE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.DASH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 120,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SKULL_BASH_FERAL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SHADOWMELD,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 120,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SURVIVAL_INSTINCTS,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 120,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.REBIRTH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MIGHTY_BASH_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      isActive: combatant => combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
      getCooldown: haste => 50,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      isActive: combatant => combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.TYPHOON_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      isActive: combatant => combatant.hasTalent(SPELLS.TYPHOON_TALENT.id),
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.RENEWAL_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      isActive: combatant => combatant.hasTalent(SPELLS.TYPHOON_TALENT.id),
      getCooldown: haste => 90,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DISPLACER_BEAST_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      isActive: combatant => combatant.hasTalent(SPELLS.DISPLACER_BEAST_TALENT.id),
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.WILD_CHARGE_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      isActive: combatant => combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;
