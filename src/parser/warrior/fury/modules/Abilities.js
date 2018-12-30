import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ITEMS from 'common/ITEMS';

import CoreAbilities from 'parser/core/modules/Abilities';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: SPELLS.BLOODTHIRST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.3,
        },
      },
      {
        spell: SPELLS.RAGING_BLOW,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => (8 - (combatant.hasTalent(SPELLS.INNER_RAGE_TALENT.id) ? 1 : 0)) / (1 + haste),
        charges: 2,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RAMPAGE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL, // Needs 85 rage, if using Frothing Berserker one should only Rampage whilst at 100 rage.
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.EXECUTE_FURY, SPELLS.EXECUTE_FURY_MASSACRE],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FURIOUS_SLASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.FURIOUS_SLASH_TALENT.id),
      },
      {
        spell: SPELLS.SIEGEBREAKER_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        enabled: combatant.hasTalent(SPELLS.SIEGEBREAKER_TALENT.id),
      },
      // Rotational AOE
      {
        spell: SPELLS.WHIRLWIND_FURY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DRAGON_ROAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 35,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.DRAGON_ROAR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      // Others
      {
        spell: SPELLS.VICTORY_RUSH,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id),
      },
      {
        spell: SPELLS.IMPENDING_VICTORY_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id),
      },
      // Cooldown
      {
        spell: SPELLS.RECKLESSNESS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.BLADESTORM_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.BLADESTORM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      // Defensive
      {
        spell: SPELLS.ENRAGED_REGENERATION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        buffSpellId: SPELLS.ENRAGED_REGENERATION.id,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          extraSuggestion: 'Use it to reduce damage taken for a short period.',
        },
      },
      {
        spell: SPELLS.RALLYING_CRY,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        buffSpellId: SPELLS.RALLYING_CRY_BUFF.id,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
          extraSuggestion: 'Use it preemptively as a buffer against large AOE, or reactively if you notice your raid is getting dangerously low on health.',
        },
      },
      // Utility
      {
        spell: SPELLS.CHARGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20 - (combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 1 : 0),
      },
      {
        spell: SPELLS.HEROIC_LEAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        buffSpellId: SPELLS.BOUNDING_STRIDE_BUFF.id,
        cooldown: (haste, combatant) => 45 - (combatant.hasTalent(SPELLS.BOUNDING_STRIDE_TALENT.id) ? 15 : 0),
        charges: 1 + (combatant.hasShoulder(ITEMS.TIMELESS_STRATAGEM.id) ? 2 : 0),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.1,
          importance: ISSUE_IMPORTANCE.MINOR,
          extraSuggestion: <>Consider using <SpellLink id={SPELLS.WARPAINT_TALENT.id} /> if the fight requires little mobility.</>,
        },
      },
      {
        spell: SPELLS.STORM_BOLT_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.4,
          extraSuggestion: 'If you\'re picking a utility talent over something that increases your mobility or survivability, you better use it.',
        },
        enabled: combatant.hasTalent(SPELLS.STORM_BOLT_TALENT.id),
      },
      {
        spell: SPELLS.PUMMEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.BERSERKER_RAGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        buffSpellId: SPELLS.BERSERKER_RAGE.id,
        cooldown: 60,
        gcd: null,
      },
      {
        spell: SPELLS.HEROIC_THROW,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INTIMIDATING_SHOUT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PIERCING_HOWL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BATTLE_SHOUT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TAUNT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: null,
      },
    ];
  }
}

export default Abilities;
