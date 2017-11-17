import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    // Rotational Spells
    {
      spell: SPELLS.KEG_SMASH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 8 / (1 + haste),
    },
    {
      spell: SPELLS.BLACKOUT_STRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 3,
    },
    {
      spell: SPELLS.BREATH_OF_FIRE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 15,
    },
    {
      spell: SPELLS.TIGER_PALM,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EXPLODING_KEG,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 75,
    },
    {
      spell: SPELLS.RUSHING_JADE_WIND_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 6 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT.id),
    },
    {
      spell: SPELLS.CRACKLING_JADE_LIGHTNING,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    // Cooldowns
    {
      spell: SPELLS.IRONSKIN_BREW,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.PURIFYING_BREW,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.BLACK_OX_BREW_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EXPEL_HARM,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.FORTIFYING_BREW_BRM,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.HEALING_ELIXIR_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
      noSuggestion: true,
    },
    {
      spell: SPELLS.DAMPEN_HARM_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
      noSuggestion: true,
    },
    {
      spell: SPELLS.ZEN_MEDITATION,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 300,
      noSuggestion: true,
    },
    // Utility
    {
      spell: SPELLS.LEG_SWEEP_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.LEG_SWEEP_TALENT.id),
    },
    {
      spell: SPELLS.RING_OF_PEACE_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.RING_OF_PEACE_TALENT.id),
    },
    {
      spell: SPELLS.CHI_TORPEDO_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
    },
    {
      spell: SPELLS.ROLL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => !combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
    },
    {
      spell: SPELLS.TRANSCENDENCE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.TRANSCENDENCE_TRANSFER,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id),
    },
    {
      spell: SPELLS.SUMMON_BLACK_OX_STATUE_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id),
    },
    {
      spell: SPELLS.PARALYSIS,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
    },
    // Its unlikely that these spells will ever be cast but if they are they will show.
    {
      spell: SPELLS.DETOX,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EFFUSE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.TIGERS_LUST_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.TIGERS_LUST_TALENT.id),
    },
  ];
}

export default Abilities;
