import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';


class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.DEVASTATE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.REVENGE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SHIELD_SLAM,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 9 / (1 + haste),
      extraSuggestion: 'Casting Shield Slam regularly is very important for performing well.',
    },
    {
      spell: SPELLS.THUNDER_CLAP,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 6 / (1 + haste),
      extraSuggestion: 'Casting Thunder Clap regularly is very important for performing well.',
    },
    {
      spell: SPELLS.IGNORE_PAIN,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.NELTHARIONS_FURY,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SHIELD_BLOCK,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 13 / (1 + haste),
      noSuggestion: true,
    },
    {
      spell: SPELLS.DEMORALIZING_SHOUT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      noSuggestion: true,
    },
    {
      spell: SPELLS.LAST_STAND,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SHIELD_WALL,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 240,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SPELL_REFLECTION,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 25,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.HEROIC_LEAP,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.HEROIC_THROW,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.INTERCEPT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      charges: 2,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.TAUNT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 8,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BATTLE_CRY,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
    },
    {
      spell: SPELLS.BERSERKER_RAGE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 45,
    },
    {
      spell: SPELLS.PUMMEL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.VICTORY_RUSH,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default CastEfficiency;
