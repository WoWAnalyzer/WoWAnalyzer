import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.BLOODTHIRST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.INNER_RAGE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.BLOODTHIRST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.INNER_RAGE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.3,
        },
      },
      {
        spell: SPELLS.FURIOUS_SLASH,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.EXECUTE_FURY,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.RAGING_BLOW,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.INNER_RAGE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.RAGING_BLOW,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.INNER_RAGE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.RAMPAGE,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // Needs 85 rage, if using Frothing Berserker one should only Rampage whilst at 100 rage.
      },
      {
        spell: SPELLS.BATTLE_CRY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 50, // TODO: Add custom function that depends on CoF (and Odyn's Champion) (RNG)
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.ODYNS_FURY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.AVATAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.AVATAR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.STORM_BOLT_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.STORM_BOLT_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.SHOCKWAVE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 40,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.SHOCKWAVE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.25,
          extraSuggestion: <React.Fragment>Consider using <SpellLink id={SPELLS.DOUBLE_TIME_TALENT.id} /> or <SpellLink id={SPELLS.STORM_BOLT_TALENT.id} /> unless the CC is strictly needed.</React.Fragment>,
        },
      },
      {
        spell: SPELLS.BLOODBATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.BLOODBATH_TALENT.id),
        // Should verify that it is used with every Battle Cry
      },
      {
        spell: SPELLS.BLADESTORM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.BLADESTORM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.DRAGON_ROAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 25,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.WHIRLWIND_FURY,
        isOnGCD: true,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      },
      {
        spell: SPELLS.BERSERKER_RAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.OUTBURST_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          extraSuggestion: <React.Fragment>Use to cause <SpellLink id={SPELLS.ENRAGE.id} /> as often as possible or consider using another talent such as <SpellLink id={SPELLS.AVATAR_TALENT.id} />.</React.Fragment>,
        },
      },
      {
        spell: SPELLS.BERSERKER_RAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.OUTBURST_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: <React.Fragment>Use to cause <SpellLink id={SPELLS.ENRAGE.id} /> as often as possible.</React.Fragment>,
        },
      },
      {
        spell: SPELLS.BERSERKER_RAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        enabled: !combatant.hasTalent(SPELLS.OUTBURST_TALENT.id),
      },
      {
        spell: SPELLS.ENRAGED_REGENERATION,
        buffSpellId: SPELLS.ENRAGED_REGENERATION.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          extraSuggestion: 'Use it to reduce damage taken for a short period.',
        },
      },
      {
        spell: SPELLS.COMMANDING_SHOUT,
        buffSpellId: SPELLS.COMMANDING_SHOUT_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          extraSuggestion: 'Use it to support your raid prior to massive raid damage.',
        },
      },
      {
        spell: SPELLS.CHARGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 20 - 3 : 20,
        charges: combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 2 : 1,
      },
      {
        spell: SPELLS.HEROIC_THROW,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 6,
        isOnGCD: true,
      },
      {
        spell: SPELLS.HEROIC_LEAP_FURY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: (haste, combatant) => 45 - (combatant.hasTalent(SPELLS.BOUNDING_STRIDE_TALENT.id) ? 15 : 0),
        charges: 1 + (combatant.hasShoulder(ITEMS.TIMELESS_STRATAGEM.id) ? 2 : 0),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.1,
          importance: ISSUE_IMPORTANCE.MINOR,
          extraSuggestion: <React.Fragment>Consider using <SpellLink id={SPELLS.WARPAINT_TALENT.id} /> if the fight requires little mobility.</React.Fragment>,
        },
      },
      {
        spell: SPELLS.PUMMEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
      },
    ];
  }
}

export default Abilities;
