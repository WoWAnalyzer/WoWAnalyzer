import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    {
      spell: SPELLS.FURY_OF_THE_ILLIDARI,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      recommendedEfficiency: 0.9,
      extraSuggestion: `This does a huge ammount of AoE passive damage and it's one of the main damage spells for Havoc Demon Hunters. You should cast it as soon as it become available. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output.`,
    },
    {
      spell: SPELLS.METAMORPHOSIS_HAVOC,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => 300 - (combatant.traitsBySpellId[SPELLS.UNLEASHED_DEMONS.id] || 0) * 20,
      recommendedEfficiency: 1.0,
    },
    {
      spell: SPELLS.NEMESIS_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.NEMESIS_TALENT.id),
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      recommendedEfficiency: 0.95,
      extraSuggestion: 'This is your main damage increase buff. You should use it as much as you can to maximize your damage output.',
    },
    {
      spell: SPELLS.CHAOS_BLADES_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.CHAOS_BLADES_TALENT.id),
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedEfficiency: 0.95,
      extraSuggestion: `This plus Nemesis and Metamorphosis make up your huge windows.`,
    },
    {
      spell: SPELLS.MOMENTUM_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id),
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 10,
      recommendedEfficiency: 0.95,
      extraSuggestion: 'This is your main damage increase buff. You should use it as much as you can to maximize your damage output.',
    },
    {
      spell: SPELLS.FEL_ERUPTION_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id),
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      recommendedEfficiency: 0.95,
      extraSuggestion: 'This is a great Chaos burst damage spell and it does a huge single target DPS increase by just 10 Fury per cast. Should definitively be used as soon as it gets available.',
    },
    {
      spell: SPELLS.FEL_BARRAGE_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id),
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      recommendedEfficiency: 0.85,
      extraSuggestion: `This is a great AoE damage spell, but also does a great damage on single target. You should cast it as soon as it gets off cooldown. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output.`,
    },
    {
      spell: SPELLS.FELBLADE_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 15 / (1 + haste),
      recommendedEfficiency: 0.85,
      extraSuggestion: 'This is your main Fury filler spell. Try to always cast on cooldown, but beware to not waste the Fury generation it provides. So use it when you have 30 or more Fury missing. And also it can be used to charge to the desired target, making it very strong movement spell.',
    },
    {
      spell: SPELLS.EYE_BEAM,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DEMONS_BITE,
      isActive: combatant => !combatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id),
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CHAOS_STRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ANNIHILATION,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BLADE_DANCE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, //10 / (1 + haste),
      noSuggestion: true,
    },
    {
      spell: SPELLS.DEATH_SWEEP,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, //8 / (1+ haste),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.THROW_GLAIVE_HAVOC,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FEL_RUSH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 10,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.VENGEFUL_RETREAT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 25,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BLUR,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 60,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DARKNESS,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CHAOS_NOVA,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 60,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;
