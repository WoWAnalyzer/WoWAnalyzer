import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,

    {
      spell: SPELLS.WINDBURST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20,
      recommendedCastEfficiency: 0.85, // TODO look at reasonable use, not on CD but as much as makes sense
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.AIMED_SHOT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.ARCANE_SHOT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.MULTISHOT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.MARKED_SHOT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.BLACK_ARROW_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 13,
      isActive: combatant => combatant.hasTalent(SPELLS.BLACK_ARROW_TALENT.id),
    },
    {
      spell: SPELLS.EXPLOSIVE_SHOT_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id),
    },
    {
      spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.BARRAGE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20,
      isActive: combatant => combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.SIDEWINDERS_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 10.4, // TODO handle charges correctly
      isActive: combatant => combatant.hasTalent(SPELLS.SIDEWINDERS_TALENT.id),
    },
    {
      spell: SPELLS.PIERCING_SHOT_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.TRUESHOT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180, // TODO calculate cd reduction based on artifact
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.EXHILARATION,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 120,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BURSTING_SHOT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 24,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CONCUSSIVE_SHOT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 5,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.COUNTER_SHOT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 24,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MISDIRECTION,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BINDING_SHOT_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ASPECT_OF_THE_TURTLE,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ASPECT_OF_THE_CHEETAH,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FREEZING_TRAP,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.TAR_TRAP,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default CastEfficiency;
