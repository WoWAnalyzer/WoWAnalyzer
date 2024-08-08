import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import type { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: SPELLS.REND.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.HEROIC_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
        // not sure if this is kosher but it feels weird to  build a whole module for this
        cooldown: () => (this.selectedCombatant.hasBuff(SPELLS.INNER_RAGE.id) ? 1.5 : 3),
      },
      {
        spell: SPELLS.CLEAVE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: null,
        cooldown: () => (this.selectedCombatant.hasBuff(SPELLS.INNER_RAGE.id) ? 1.5 : 3),
      },
      {
        spell: SPELLS.MORTAL_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 4.5,
      },
      {
        spell: SPELLS.SLAM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.COLOSSUS_SMASH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 20,
      },
      {
        spell: SPELLS.WHIRLWIND.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Execute and Overpower are handled in separate modules
      // Rotational AOE
      // Cooldowns
      {
        spell: SPELLS.INNER_RAGE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 30,
      },
      {
        spell: SPELLS.DEADLY_CALM.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: SPELLS.RECKLESSNESS.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 300,
      },
      // these are cooldowns but you never ever use them in single-target
      {
        spell: SPELLS.SWEEPING_STRIKES.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: null,
        cooldown: 60,
      },
      {
        spell: SPELLS.BLADESTORM.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: null,
        cooldown: 90,
      },
      // Defensive
      {
        spell: SPELLS.RALLYING_CRY.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 180,
      },
      // Other spells (not apart of the normal rotation)
      // Utility
      {
        spell: SPELLS.HEROIC_LEAP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 60,
      },
      {
        spell: SPELLS.CHARGE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 12, // Arms talent Juggernaut + Glyph of Rapid Charge
        gcd: null,
      },
      {
        spell: SPELLS.INTERVENE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.TAUNT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.BATTLE_STANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.DEFENSIVE_STANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.BERSERKER_STANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.BERSERKER_RAGE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 30,
      },
      {
        spell: SPELLS.PUMMEL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 10,
      },
      // Pet Related
      // Consumable
    ] satisfies SpellbookAbility[];
  }
}

export default Abilities;
