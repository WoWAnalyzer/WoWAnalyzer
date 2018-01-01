import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  static ABILITIES = [
    {
      spell: SPELLS.DEVASTATE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.REVENGE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SHIELD_SLAM,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 9 / (1 + haste),
      extraSuggestion: 'Casting Shield Slam regularly is very important for performing well.',
    },
    {
      spell: SPELLS.THUNDER_CLAP,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 6 / (1 + haste),
      extraSuggestion: 'Casting Thunder Clap regularly is very important for performing well.',
    },
    {
      spell: SPELLS.IGNORE_PAIN,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.NELTHARIONS_FURY,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SHIELD_BLOCK,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 13 / (1 + haste),
      noSuggestion: true,
    },
    {
      spell: SPELLS.DEMORALIZING_SHOUT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      noSuggestion: true,
    },
    {
      spell: SPELLS.LAST_STAND,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SHIELD_WALL,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 240,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SPELL_REFLECTION,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 25,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.HEROIC_LEAP,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.HEROIC_THROW,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.INTERCEPT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      charges: 2,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.TAUNT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 8,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BATTLE_CRY,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
    },
    {
      spell: SPELLS.BERSERKER_RAGE,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 45,
    },
    {
      spell: SPELLS.PUMMEL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.VICTORY_RUSH,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;
