import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational Spells
      {
        spell: SPELLS.KEG_SMASH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 8 / (1 + haste),
        charges: combatant.hasLegendary(SPELLS.STORMSTOUTS_LAST_KEG) ? 2 : 1,
        damageSpellIds: [SPELLS.KEG_SMASH.id],
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.BLACKOUT_KICK_BRM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 4,
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.BREATH_OF_FIRE.id,
        isDefensive: true,
        buffSpellId: SPELLS.BREATH_OF_FIRE_DEBUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.TIGER_PALM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.RUSHING_JADE_WIND_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 6 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT.id),
        buffSpellId: SPELLS.RUSHING_JADE_WIND_TALENT.id,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.CHI_BURST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.CHI_WAVE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          // This was tested in-game (in Legion): it does NOT have a static GCD but a base GCD of 1sec and scales with Haste
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPINNING_CRANE_KICK_BRM.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          static: 1000,
        },
      },
      // Cooldowns
      {
        spell: SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.PURIFYING_BREW.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: (haste) =>
          (combatant.hasTalent(SPELLS.LIGHT_BREWING_TALENT) ? 16 : 20) / (1 + haste),
        charges: 2,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.CELESTIAL_BREW.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.LIGHT_BREWING_TALENT) ? 48 : 60,
        gcd: {
          base: 1000,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
        },
      },
      {
        spell: SPELLS.BLACK_OX_BREW_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.7,
        },
        enabled: combatant.hasTalent(SPELLS.BLACK_OX_BREW_TALENT.id),
        gcd: null,
      },
      {
        spell: SPELLS.EXPEL_HARM.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 5,
        gcd: {
          static: 500,
        },
      },
      {
        spell: SPELLS.FORTIFYING_BREW_BRM.id,
        buffSpellId: SPELLS.FORTIFYING_BREW_BRM_BUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 420,
        gcd: null,
      },
      {
        spell: SPELLS.HEALING_ELIXIR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
        gcd: null,
      },
      {
        spell: SPELLS.DAMPEN_HARM_TALENT.id,
        buffSpellId: SPELLS.DAMPEN_HARM_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
        gcd: null,
      },
      {
        spell: SPELLS.ZEN_MEDITATION.id,
        buffSpellId: SPELLS.ZEN_MEDITATION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 300,
        gcd: null,
      },
      // Utility
      {
        spell: SPELLS.RING_OF_PEACE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.RING_OF_PEACE_TALENT.id),
        gcd: {
          // This was tested in-game (in Legion): it does NOT have a static GCD but a base GCD of 1sec and scales with Haste
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHI_TORPEDO_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
        cooldown: 20,
        charges: 2,
        // Both Roll and Chi Torpedo don't actually have a GCD but block all spells during its animation for about the same duration, so maybe time it in-game and mark it as channeling instead? The issue is you can follow up any ability on the GCD with chi torpedo/roll, so it can still cause overlap.
        gcd: null,
      },
      {
        spell: SPELLS.ROLL.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: !combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
        cooldown: combatant.hasTalent(SPELLS.CELERITY_TALENT.id) ? 15 : 20,
        charges: combatant.hasTalent(SPELLS.CELERITY_TALENT.id) ? 3 : 2,
        // Both Roll and Chi Torpedo don't actually have a GCD but block all spells during its animation for about the same duration, so maybe time it in-game and mark it as channeling instead? The issue is you can follow up any ability on the GCD with chi torpedo/roll, so it can still cause overlap.
        gcd: null,
      },
      {
        spell: SPELLS.TRANSCENDENCE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.TRANSCENDENCE_TRANSFER.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          // This was tested in-game (in Legion): it does NOT have a static GCD but a base GCD of 1sec and scales with Haste
          base: 1500,
        },
      },
      {
        spell: SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.SUMMON_BLACK_OX_STATUE_TALENT.id),
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.PARALYSIS.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.LEG_SWEEP.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.TIGER_TAIL_SWEEP_TALENT.id) ? 50 : 60,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.PROVOKE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.SPEAR_HAND_STRIKE.id,
        cooldown: 15,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      // Its unlikely that these spells will ever be cast but if they are they will show.
      {
        spell: SPELLS.DETOX_ENERGY.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          // This was tested in-game (in Legion): it does NOT have a static GCD but a base GCD of 1sec and scales with Haste
          base: 1500,
        },
      },
      {
        spell: SPELLS.VIVIFY.id, // don't know if the vivify spell has been updated to the new ID yet
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TIGERS_LUST_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.TIGERS_LUST_TALENT.id),
        cooldown: 30,
        gcd: {
          static: 1000,
        },
      },
    ];
  }
}

export default Abilities;
