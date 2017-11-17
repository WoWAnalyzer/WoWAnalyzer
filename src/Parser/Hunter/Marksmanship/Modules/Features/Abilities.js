import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {

  static ABILITIES = [
    ...CoreAbilities.ABILITIES,

    {
      spell: SPELLS.WINDBURST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20,
      recommendedCastEfficiency: 0.75,
      extraSuggestion: <span>You should cast it whenever you cannot fit another <SpellLink id={SPELLS.AIMED_SHOT.id} /> in your current <SpellLink id={SPELLS.VULNERABLE.id} /> window, which will generally almost always translate into almost on cooldown. It is your best <SpellLink id={SPELLS.VULNERABLE.id} /> generator, as it allows extra globals to be cast inside the window, allowing you to cast <SpellLink id={SPELLS.WINDBURST.id} /> at almost no focus. </span>,
    },
    {
      spell: SPELLS.AIMED_SHOT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.ARCANE_SHOT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.MULTISHOT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.MARKED_SHOT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.BLACK_ARROW_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 13,
      isActive: combatant => combatant.hasTalent(SPELLS.BLACK_ARROW_TALENT.id),
    },
    {
      spell: SPELLS.EXPLOSIVE_SHOT_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.EXPLOSIVE_SHOT_TALENT.id),
    },
    {
      spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
      recommendedCastEfficiency: 0.8,
      extraSuggestion: <span> You should aim to cast <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> on cooldown generally, and the last usage should be as early in the execute window (sub-20%) as possible, to allow for stacking of <SpellLink id={SPELLS.BULLSEYE_TRAIT.id} /> as fast as possible. This can mean delaying it for up to 20-30 seconds sometimes which can lower your cast-efficiency, even though you're playing optimally.</span>,
    },
    {
      spell: SPELLS.BARRAGE_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20,
      isActive: combatant => combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.SIDEWINDERS_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      charges: 2,
      isActive: combatant => combatant.hasTalent(SPELLS.SIDEWINDERS_TALENT.id),
    },
    {
      spell: SPELLS.PIERCING_SHOT_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.PIERCING_SHOT_TALENT.id),
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.TRUESHOT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (_, combatant) => 180 - combatant.owner.modules.quickShot.traitCooldownReduction,
      recommendedCastEfficiency: 1.0,
    },
    {
      spell: SPELLS.EXHILARATION,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 120,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    { //Marking as a defensive because of the damage reduction trait associated with it
      spell: SPELLS.DISENGAGE_TALENT,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 20,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BURSTING_SHOT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 24,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CONCUSSIVE_SHOT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 5,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.COUNTER_SHOT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 24,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MISDIRECTION,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BINDING_SHOT_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ASPECT_OF_THE_TURTLE,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ASPECT_OF_THE_CHEETAH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FREEZING_TRAP,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.TAR_TRAP,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;
