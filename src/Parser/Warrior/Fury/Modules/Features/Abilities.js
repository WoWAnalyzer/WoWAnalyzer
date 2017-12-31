import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';
import Wrapper from 'common/Wrapper';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    {
      spell: SPELLS.BLOODTHIRST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 4.5 / (1 + haste),
      recommendedEfficiency: 0.8,
      isActive: combatant => combatant.hasTalent(SPELLS.INNER_RAGE_TALENT.id),
    },
    {
      spell: SPELLS.BLOODTHIRST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 4.5 / (1 + haste),
      recommendedEfficiency: 0.3,
      isActive: combatant => !combatant.hasTalent(SPELLS.INNER_RAGE_TALENT.id),
    },
    {
      spell: SPELLS.FURIOUS_SLASH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EXECUTE_FURY,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.RAGING_BLOW,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 4.5 / (1 + haste),
      recommendedEfficiency: 0.8,
      isActive: combatant => combatant.hasTalent(SPELLS.INNER_RAGE_TALENT.id),
    },
    {
      spell: SPELLS.RAGING_BLOW,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      recommendedEfficiency: 0.8,
      isActive: combatant => !combatant.hasTalent(SPELLS.INNER_RAGE_TALENT.id),
    },
    {
      spell: SPELLS.RAMPAGE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null, // Needs 85 rage, if using Frothing Berserker one should only Rampage whilst at 100 rage.
    },
    {
      spell: SPELLS.BATTLE_CRY,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 50, // TODO: Add custom function that depends on CoF (and Odyn's Champion) (RNG)
      recommendedEfficiency: 0.95,
    },
    {
      spell: SPELLS.ODYNS_FURY,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 45,
      recommendedEfficiency: 0.9,
    },
    {
      spell: SPELLS.AVATAR_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isActive: combatant => combatant.hasTalent(SPELLS.AVATAR_TALENT.id),
      recommendedEfficiency: 0.95,
    },
    {
      spell: SPELLS.STORM_BOLT_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.STORM_BOLT_TALENT.id),
      recommendedEfficiency: 0.95,
    },
    {
      spell: SPELLS.SHOCKWAVE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 40,
      isActive: combatant => combatant.hasTalent(SPELLS.SHOCKWAVE_TALENT.id),
      recommendedEfficiency: 0.25,
      extraSuggestion: <Wrapper>Consider using <SpellLink id={SPELLS.DOUBLE_TIME_TALENT.id} /> or <SpellLink id={SPELLS.STORM_BOLT_TALENT.id} /> unless the CC is strictly needed.</Wrapper>,
    },
    {
      spell: SPELLS.BLOODBATH_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.BLOODBATH_TALENT.id),
      // Should verify that it is used with every Battle Cry
      noCanBeImproved: true,
      noSuggestion: true,
    },
    {
      spell: SPELLS.BLADESTORM_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isActive: combatant => combatant.hasTalent(SPELLS.BLADESTORM_TALENT.id),
      recommendedEfficiency: 0.8,
    },
    {
      spell: SPELLS.DRAGON_ROAR_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 25,
      isActive: combatant => combatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id),
      recommendedEfficiency: 0.8,
    },
    {
      spell: SPELLS.WHIRLWIND_FURY,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE or as a filler with the Wrecking Ball talent.',
    },
    {
      spell: SPELLS.BERSERKER_RAGE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      recommendedEfficiency: 0.5,
      extraSuggestion: <Wrapper>Use to cause <SpellLink id={SPELLS.ENRAGE.id} /> as often as possible or consider using another talent such as <SpellLink id={SPELLS.AVATAR_TALENT.id} />.</Wrapper>,
      isActive: combatant => combatant.hasTalent(SPELLS.OUTBURST_TALENT.id),
    },
    {
      spell: SPELLS.BERSERKER_RAGE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      recommendedEfficiency: 0.95,
      extraSuggestion: <Wrapper>Use to cause <SpellLink id={SPELLS.ENRAGE.id} /> as often as possible.</Wrapper>,
      isActive: combatant => combatant.hasTalent(SPELLS.OUTBURST_TALENT.id),
    },
    {
      spell: SPELLS.BERSERKER_RAGE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 60,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => !combatant.hasTalent(SPELLS.OUTBURST_TALENT.id),
    },
    {
      spell: SPELLS.ENRAGED_REGENERATION,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 120,
      noCanBeImproved: true,
      importance: ISSUE_IMPORTANCE.MINOR,
      extraSuggestion: 'Use it to reduce damage taken for a short period.',
    },
    {
      spell: SPELLS.COMMANDING_SHOUT,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 180,
      noCanBeImproved: true,
      importance: ISSUE_IMPORTANCE.MINOR,
      extraSuggestion: 'Use it to support your raid prior to massive raid damage.',
    },
    {
      spell: SPELLS.CHARGE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 17,
      noCanBeImproved: true,
      noSuggestion: true,
      extraSuggestion: 'Use to close the gap.',
    },
    {
      spell: SPELLS.HEROIC_LEAP_FURY,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, combatant) => 45 - (combatant.hasTalent(SPELLS.BOUNDING_STRIDE_TALENT.id) ? 15 : 0),
      recommendedEfficiency: 0.1,
      noCanBeImproved: true,
      importance: ISSUE_IMPORTANCE.MINOR,
      extraSuggestion: <Wrapper>Consider using <SpellLink id={SPELLS.WARPAINT_TALENT.id} /> if the fight requires little mobility.</Wrapper>,
      isActive: combatant => !combatant.hasShoulder(ITEMS.TIMELESS_STRATAGEM.id),
    },
    {
      spell: SPELLS.HEROIC_LEAP_FURY,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, combatant) => 45 - (combatant.hasTalent(SPELLS.BOUNDING_STRIDE_TALENT.id) ? 15 : 0),
      recommendedEfficiency: 0.1,
      noCanBeImproved: true,
      importance: ISSUE_IMPORTANCE.MINOR,
      extraSuggestion: <Wrapper>Consider using <SpellLink id={SPELLS.WARPAINT_TALENT.id} /> if the fight requires little mobility.</Wrapper>,
      charges: 3,
      isActive: combatant => combatant.hasShoulder(ITEMS.TIMELESS_STRATAGEM.id),
    },
    {
      spell: SPELLS.PUMMEL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;
