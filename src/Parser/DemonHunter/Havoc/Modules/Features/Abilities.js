import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.FURY_OF_THE_ILLIDARI,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion: `This does a huge ammount of AoE passive damage and it's one of the main damage spells for Havoc Demon Hunters. You should cast it as soon as it become available. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output.`,
        },
      },
      {
        spell: SPELLS.METAMORPHOSIS_HAVOC,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => 300 - (combatant.traitsBySpellId[SPELLS.UNLEASHED_DEMONS.id] || 0) * 20,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: SPELLS.NEMESIS_TALENT,
        enabled: combatant.hasTalent(SPELLS.NEMESIS_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'This is your main damage increase buff. You should use it as much as you can to maximize your damage output.',
        },
      },
      {
        spell: SPELLS.CHAOS_BLADES_TALENT,
        enabled: combatant.hasTalent(SPELLS.CHAOS_BLADES_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: `This plus Nemesis and Metamorphosis make up your huge windows.`,
        },
      },
      {
        spell: SPELLS.MOMENTUM_TALENT,
        enabled: combatant.hasTalent(SPELLS.MOMENTUM_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 10,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'This is your main damage increase buff. You should use it as much as you can to maximize your damage output.',
        },
      },
      {
        spell: SPELLS.FEL_ERUPTION_TALENT,
        enabled: combatant.hasTalent(SPELLS.FEL_ERUPTION_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'This is a great Chaos burst damage spell and it does a huge single target DPS increase by just 10 Fury per cast. Should definitively be used as soon as it gets available.',
        },
      },
      {
        spell: SPELLS.FEL_BARRAGE_TALENT,
        enabled: combatant.hasTalent(SPELLS.FEL_BARRAGE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: `This is a great AoE damage spell, but also does a great damage on single target. You should cast it as soon as it gets off cooldown. The only moment you can delay it's cast is if you already expect an add wave to maximize it's efficiency and damage output.`,
        },
      },
      {
        spell: SPELLS.FELBLADE_TALENT,
        enabled: combatant.hasTalent(SPELLS.FELBLADE_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 15 / (1 + haste),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion: 'This is your main Fury filler spell. Try to always cast on cooldown, but beware to not waste the Fury generation it provides. So use it when you have 30 or more Fury missing. And also it can be used to charge to the desired target, making it very strong movement spell.',
        },
      },
      {
        spell: SPELLS.EYE_BEAM,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
      },
      {
        spell: SPELLS.DEMONS_BITE,
        enabled: !combatant.hasTalent(SPELLS.DEMON_BLADES_TALENT.id),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.CHAOS_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.ANNIHILATION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.BLADE_DANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, //10 / (1 + haste),
      },
      {
        spell: SPELLS.DEATH_SWEEP,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, //8 / (1+ haste),
      },
      {
        spell: SPELLS.THROW_GLAIVE_HAVOC,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.FEL_RUSH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
      },
      {
        spell: SPELLS.VENGEFUL_RETREAT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
      },
      {
        spell: SPELLS.BLUR,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
      },
      {
        spell: SPELLS.DARKNESS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
      },
      {
        spell: SPELLS.CHAOS_NOVA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
      },
    ];
  }
}

export default Abilities;
