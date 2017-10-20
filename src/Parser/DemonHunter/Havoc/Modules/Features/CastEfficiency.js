import SPELLS from 'common/SPELLS';
import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.FURY_OF_THE_ILLIDARI,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      recommendedCastEfficiency: 0.9,
      extraSuggestion: `This does a huge ammount of AoE passive damage and it's one of the main damage spells for Havoc Demon Hunters. You should cast it as soon as it become available. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output.`,
    },
    {
      spell: SPELLS.METAMORPHOSIS_HAVOC,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => 300 - (combatant.traitsBySpellId[SPELLS.UNLEASHED_DEMONS.id] || 0) * 20,
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.NEMESIS_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.NEMESIS_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      recommendedCastEfficiency: 0.95,
      extraSuggestion: 'This is your main damage increase buff. You should use it as much as you can to maximize your damage output.',
    },
    {
      spell: SPELLS.CHAOS_BLADES_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.CHAOS_BLADES_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedCastEfficiency: 0.95,
      extraSuggestion: `This plus Nemesis and Metamorphosis make up your huge windows.`,
    },
    {
      spell: SPELLS.MOMENTUM_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 10,
      recommendedCastEfficiency: 0.95,
      extraSuggestion: 'This is your main damage increase buff. You should use it as much as you can to maximize your damage output.',
    },
    {
      spell: SPELLS.FEL_ERUPTION_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      recommendedCastEfficiency: 0.95,
      extraSuggestion: 'This is a great Chaos burst damage spell and it does a huge single target DPS increase by just 10 Fury per cast. Should definitively be used as soon as it gets available.',
    },
    {
      spell: SPELLS.FEL_BARRAGE_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      recommendedCastEfficiency: 0.85,
      extraSuggestion: `This is a great AoE damage spell, but also does a great damage on single target. You should cast it as soon as it gets off cooldown. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output.`,
    },
    {
      spell: SPELLS.FELBLADE_TALENT,
      isActive: combatant => combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 10 / (1 + haste),
      recommendedCastEfficiency: 0.85,
      extraSuggestion: 'This is your main Fury filler spell. Try to always cast on cooldown, but beware to not waste the Fury generation it provides. So use it when you have 30 or more Fury missing. And also it can be used to charge to the desired target, making it very strong movement spell.',
    },
    {
      spell: SPELLS.EYE_BEAM,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DEMONS_BITE,
      isActive: combatant => !combatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id),
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CHAOS_STRIKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ANNIHILATION,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BLADE_DANCE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, //10 / (1 + haste),
      noSuggestion: true,
    },
    {
      spell: SPELLS.DEATH_SWEEP,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, //8 / (1+ haste),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.THROW_GLAIVE_HAVOC,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FEL_RUSH,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 10,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.VENGEFUL_RETREAT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 25,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BLUR,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 60,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DARKNESS,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CHAOS_NOVA,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 60,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default CastEfficiency;
