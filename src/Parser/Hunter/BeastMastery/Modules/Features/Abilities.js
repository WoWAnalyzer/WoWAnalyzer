import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {

  static ABILITIES = [
    ...CoreAbilities.ABILITIES,

    {
      spell: SPELLS.TITANS_THUNDER,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
      recommendedEfficiency: 0.9,
      extraSuggestion: <span><SpellLink id={SPELLS.TITANS_THUNDER.id} /> should always be cast when you have <SpellLink id={SPELLS.DIRE_BEAST_BUFF.id} /> buff up, try to cast it right after using a <SpellLink id={SPELLS.DIRE_BEAST.id} /> for maximum efficiency. If you have <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} /> talented, you should cast <SpellLink id={SPELLS.TITANS_THUNDER.id} /> on cooldown.</span>,
    },
    {
      spell: SPELLS.BESTIAL_WRATH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 90,
      recommendedEfficiency: 1,
      extraSuggestion: <span><SpellLink id={SPELLS.BESTIAL_WRATH.id} /> should be cast on cooldown as its cooldown is quickly reset again through <SpellLink id={SPELLS.DIRE_BEAST.id} />. You want to start each <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> window with as much focus as possible.</span>,
    },
    {
      spell: SPELLS.KILL_COMMAND,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 7.5 / (1 + haste),
      recommendedEfficiency: 0.95,
    },
    {
      spell: SPELLS.COBRA_SHOT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.DIRE_BEAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      charges: 2,
      isActive: combatant => !combatant.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
    },
    {
      spell: SPELLS.DIRE_FRENZY_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      charges: 2,
      isActive: combatant => combatant.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id),
    },
    {
      spell: SPELLS.MULTISHOT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id),
      recommendedEfficiency: 0.9,
      extraSuggestion: <span> You should be casting <SpellLink id={SPELLS.A_MURDER_OF_CROWS_TALENT_SHARED.id} /> on cooldown unless <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> has less than 30 seconds remaining on CD, in which case you can delay it slightly to line them up. It will dynamically update its damage to reflect damage increases such as <SpellLink id={SPELLS.BESTIAL_WRATH.id} />. </span>,
    },
    {
      spell: SPELLS.ASPECT_OF_THE_WILD,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 120,
      recommendedEfficiency: 0.8,
      extraSuggestion: <span> <SpellLink id={SPELLS.ASPECT_OF_THE_WILD.id} /> should always be cast in conjunction with <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> to maximize the potency of these increased damage windows. </span>,
    },
    {
      spell: SPELLS.BARRAGE_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20,
      isActive: combatant => combatant.hasTalent(SPELLS.BARRAGE_TALENT.id),
      recommendedEfficiency: 1.0,
    },
    {
      spell: SPELLS.EXHILARATION,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 120,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DISENGAGE_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 20,
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
      getCooldown: haste => 180, //TODO: check for Call of the wild legendary
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ASPECT_OF_THE_CHEETAH,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180, //TODO: check for pathfinder trait and reduce CD accordingly + wrist legendary
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
