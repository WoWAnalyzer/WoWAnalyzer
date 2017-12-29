import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    // Rotational Spells
    {
      spell: SPELLS.NEW_MOON,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const availableCasts = combatant.owner.modules.newMoon.nmAvailableCasts;
        return (combatant.owner.fightDuration / 1000) / availableCasts;
      },
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.HALF_MOON,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const availableCasts = combatant.owner.modules.halfMoon.hmAvailableCasts;
        return (combatant.owner.fightDuration / 1000) / availableCasts;
      },
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.FULL_MOON,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const availableCasts = combatant.owner.modules.fullMoon.fmAvailableCasts;
        return (combatant.owner.fightDuration / 1000) / availableCasts;
      },
      noSuggestion: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.STARSURGE_MOONKIN,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.STARFALL_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.SOLAR_WRATH_MOONKIN,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.LUNAR_STRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.MOONFIRE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.SUNFIRE_CAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.STELLAR_FLARE_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.STELLAR_FLARE_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },

    // Cooldowns
    {
      spell: SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const hasIFE = combatant.hasFinger(ITEMS.IMPECCABLE_FEL_ESSENCE.id);
        return hasIFE ? 105 : 180;
      },
      isActive: combatant => combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
      recommendedEfficiency: 0.9,
    },
    {
      spell: SPELLS.CELESTIAL_ALIGNMENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const hasIFE = combatant.hasFinger(ITEMS.IMPECCABLE_FEL_ESSENCE.id);
        return hasIFE ? 105 : 180;
      },
      isActive: combatant => !combatant.hasTalent(SPELLS.INCARNATION_CHOSEN_OF_ELUNE_TALENT.id),
      recommendedEfficiency: 0.9,
    },
    {
      spell: SPELLS.WARRIOR_OF_ELUNE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 50,
      isActive: combatant => combatant.hasTalent(SPELLS.WARRIOR_OF_ELUNE_TALENT.id),
      recommendedEfficiency: 0.9,
    },
    {
      spell: SPELLS.FORCE_OF_NATURE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.FORCE_OF_NATURE_TALENT.id),
      recommendedEfficiency: 0.9,
      isOnGCD: true,
    },
    {
      spell: SPELLS.ASTRAL_COMMUNION_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 75,
      isActive: combatant => combatant.hasTalent(SPELLS.ASTRAL_COMMUNION_TALENT.id),
      recommendedEfficiency: 0.9,
    },

    //Utility
    {
      spell: SPELLS.INNERVATE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      recommendedEfficiency: 0.8,
    },
    {
      spell: SPELLS.BARKSKIN,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 60,
      recommendedEfficiency: 0.8,
      noSuggestion: true,
    },
    {
      spell: SPELLS.RENEWAL_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      isActive: combatant => combatant.hasTalent(SPELLS.RENEWAL_TALENT.id),
      recommendedEfficiency: 0.8,
      noSuggestion: true,
    },
    {
      spell: SPELLS.DISPLACER_BEAST_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.DISPLACER_BEAST_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.WILD_CHARGE_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.WILD_CHARGE_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MIGHTY_BASH_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 50,
      isActive: combatant => combatant.hasTalent(SPELLS.MIGHTY_BASH_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.MASS_ENTANGLEMENT_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.MASS_ENTANGLEMENT_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.TYPHOON_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.TYPHOON_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.ENTANGLING_ROOTS,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.DASH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true, //It is not on the GCD if already in catform. Pretty low prio to fix since you can't cast anything meaning full in catform anyway.
    },
    {
      spell: SPELLS.SOLAR_BEAM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.REMOVE_CORRUPTION,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 8,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.REBIRTH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.GROWL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 8,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ENTANGLING_ROOTS,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.BEAR_FORM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.CAT_FORM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.MOONKIN_FORM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.TRAVEL_FORM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.REGROWTH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.FRENZIED_REGENERATION,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.GUARDIAN_AFFINITY_TALENT_SHARED.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SWIFTMEND,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.REJUVENATION,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
    {
      spell: SPELLS.SWIFTMEND,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.RESTORATION_AFFINITY_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      isOnGCD: true,
    },
  ];
}

export default Abilities;
