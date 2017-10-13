import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.WAKE_OF_ASHES,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      recommendedCastEfficiency: 0.9,
      extraSuggestion: 'It has a high damage per execute time and generates a lot of holy power. It is better to waste 1-2 holy power than to hold the ability. Only hold the ability if adds are coming out in less than 3 seconds',
    },
    {
      spell: SPELLS.WAKE_OF_ASHES,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasShoulder(ITEMS.ASHES_TO_DUST.id),
      recommendedCastEfficiency: 1,
      extraSuggestion: <span>With <ItemLink id={ITEMS.ASHES_TO_DUST.id} /> it is imperative you cast this on cooldown to get the damage bonus.</span>,
      importance: ISSUE_IMPORTANCE.MAJOR,
    },
    {
      spell: SPELLS.CRUSADE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
      recommendedCastEfficiency: 0.9,
      importance: ISSUE_IMPORTANCE.MAJOR,
      extraSuggestion: <span>This is our only cooldown and where most of our damage comes from. You really want to not lose a cast of this over a fight.<br/>Note: It may be off by one cast if you use <SpellLink id={SPELLS.CRUSADE_TALENT.id} /> before the fight starts. You want to avoid doing this since your first GCD with the <SpellLink id={SPELLS.CRUSADE_TALENT.id} /> buff should be a spender.</span>,
    },
    {
      spell: SPELLS.AVENGING_WRATH,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      hideWithZeroCasts: true,
      recommendedCastEfficiency: 0.9,
    },
    {
      spell: SPELLS.HOLY_WRATH_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.HOLY_WRATH_TALENT.id),
    },
    {
      spell: SPELLS.CRUSADER_STRIKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 3.5 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.THE_FIRES_OF_JUSTICE_TALENT.id),
    },
    {
      spell: SPELLS.CRUSADER_STRIKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 4.5 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.GREATER_JUDGMENT_TALENT.id),
    },
    {
      spell: SPELLS.ZEAL_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 4.5 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.ZEAL_TALENT.id),
    },
    {
      spell: SPELLS.JUDGMENT_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
    },
    //This is the judgment CE with t20
    {
      spell: SPELLS.JUDGMENT_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      isActive: combatant => combatant.hasBuff(SPELLS.RET_PALADIN_T20_2SET_BONUS_BUFF.id),
      recommendedCastEfficiency: 0.95,
      extraSuggestion: <span>With tier 20 2 peice it is even more important to use <SpellLink id={SPELLS.JUDGMENT_CAST.id} /> on cooldown to keep up the buff</span>,
    },
    {
      spell: SPELLS.BLADE_OF_JUSTICE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // 10.5 / (1 + haste)
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.DIVINE_HAMMER_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.DIVINE_HAMMER_TALENT.id),
    },
    {
      spell: SPELLS.TEMPLARS_VERDICT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.DIVINE_STORM,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.EXECUTION_SENTENCE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20 / (1 + haste),
      isActive: combatant => combatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT.id),
    },
    {
      spell: SPELLS.SHIELD_OF_VENGEANCE,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, combatant) => 120 - (combatant.traitsBySpellId[SPELLS.DEFLECTION.id] || 0) * 10,
      noCanBeImproved: true,
      importance: ISSUE_IMPORTANCE.MINOR,
    },
    {
      spell: SPELLS.JUSTICARS_VENGEANCE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.JUSTICARS_VENGEANCE_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.EYE_FOR_AN_EYE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.EYE_FOR_AN_EYE_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.WORD_OF_GLORY_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.WORD_OF_GLORY_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.ARCANE_TORRENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      hideWithZeroCasts: true,
    },
  ];
}

export default CastEfficiency;
