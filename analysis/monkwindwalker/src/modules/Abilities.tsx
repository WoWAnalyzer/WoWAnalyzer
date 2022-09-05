import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    // Windwalker GCD is 1 second by default and static in almost all cases, 750 is lowest recorded GCD
    // Serenity's interaction with cooldowns is handled in the Serenity module
    return [
      {
        spell: SPELLS.FISTS_OF_FURY_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 24 / (1 + haste),
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          extraSuggestion:
            'Delaying the cast somewhat to line up with add spawns is acceptable, however.',
        },
      },
      {
        spell: SPELLS.RISING_SUN_KICK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 10 / (1 + haste),
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 24 / (1 + haste),
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion:
            'Delaying the cast somewhat to line up with add spawns is acceptable, however.',
        },
      },
      {
        spell: SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.BLACKOUT_KICK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
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
        spell: SPELLS.EXPEL_HARM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        gcd: {
          static: 500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.CHI_WAVE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        gcd: {
          base: 1000,
          minimum: 750,
        },
        enabled: combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.65,
        },
      },
      {
        spell: SPELLS.SPINNING_CRANE_KICK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.CHI_BURST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1000,
          minimum: 750,
        },
        enabled: combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.RUSHING_JADE_WIND_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: (haste) => 6 / (1 + haste),
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(SPELLS.RUSHING_JADE_WIND.id),
      },
      // cooldowns
      {
        spell: SPELLS.TOUCH_OF_KARMA_CAST.id,
        buffSpellId: SPELLS.TOUCH_OF_KARMA_CAST.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: 90,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          extraSuggestion:
            'Touch of Karma is typically used offensively as often as possible, but use changes a lot varying on the encounter',
        },
      },
      {
        spell: SPELLS.SERENITY_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.SERENITY_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.STORM_EARTH_AND_FIRE_CAST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: null,
        enabled: !combatant.hasTalent(SPELLS.SERENITY_TALENT.id),
        charges: 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.INVOKE_XUEN_THE_WHITE_TIGER.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1000,
          minimum: 750,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.ENERGIZING_ELIXIR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.ENERGIZING_ELIXIR_TALENT.id),
      },
      // Utility
      {
        spell: SPELLS.RING_OF_PEACE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1000,
          minimum: 750,
        },
      },
      {
        spell: SPELLS.LEG_SWEEP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.PARALYSIS.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.DISABLE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.ROLL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.CELERITY_TALENT.id) ? 15 : 20,
        gcd: null,
        charges: combatant.hasTalent(SPELLS.CELERITY_TALENT.id) ? 3 : 2,
        enabled: !combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: SPELLS.CHI_TORPEDO_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: null,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: SPELLS.FLYING_SERPENT_KICK.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.TIGERS_LUST_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(SPELLS.TIGERS_LUST_TALENT.id),
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
        cooldown: 45,
        gcd: {
          base: 1000,
          minimum: 750,
        },
      },
      {
        spell: SPELLS.VIVIFY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
          minimum: 750,
        },
      },
      {
        spell: SPELLS.DETOX_ENERGY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1000,
          minimum: 750,
        },
      },
      {
        spell: SPELLS.SPEAR_HAND_STRIKE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.PROVOKE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1000,
          minimum: 750,
        },
      },
      {
        spell: SPELLS.STORM_EARTH_AND_FIRE_FIXATE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      // Defensives
      {
        spell: SPELLS.FORTIFYING_BREW.id,
        buffSpellId: SPELLS.FORTIFYING_BREW.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.DIFFUSE_MAGIC_TALENT.id,
        buffSpellId: SPELLS.DIFFUSE_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id),
      },
      {
        spell: SPELLS.DAMPEN_HARM_TALENT.id,
        buffSpellId: SPELLS.DAMPEN_HARM_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
      },
    ];
  }
}

export default Abilities;
