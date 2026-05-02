import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { TIERS } from 'game/TIERS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    const hasMidnight4pc = combatant.has4PieceByTier(TIERS.MID1);
    const windwalkerTierCooldownReduction = hasMidnight4pc ? 5 : 0;
    const communionWithWindReduction = combatant.hasTalent(TALENTS_MONK.COMMUNION_WITH_WIND_TALENT)
      ? 5
      : 0;
    const zenithCooldownReduction =
      (combatant.hasTalent(TALENTS_MONK.EFFICIENT_TRAINING_TALENT) ? 10 : 0) +
      (combatant.hasTalent(TALENTS_MONK.SPIRITUAL_FOCUS_TALENT) ? 20 : 0);
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
        spell: TALENTS_MONK.RISING_SUN_KICK_TALENT.id,
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
        spell: TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 35 - communionWithWindReduction - windwalkerTierCooldownReduction,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.WHIRLING_DRAGON_PUNCH_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion:
            'Delaying the cast somewhat to line up with add spawns is acceptable, however.',
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
        enabled: !combatant.hasTalent(TALENTS_MONK.COMBAT_WISDOM_TALENT),
        castEfficiency: {
          suggestion: true,
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
        spell: TALENTS_MONK.CHI_BURST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1000,
          minimum: 750,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_BURST_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS_MONK.SLICING_WINDS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.SLICING_WINDS_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.RUSHING_WIND_KICK_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 750,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_WINDWALKER_TALENT),
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
        spell: TALENTS_MONK.ZENITH_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90 - zenithCooldownReduction,
        charges: 2,
        gcd: null,
        enabled: combatant.hasTalent(TALENTS_MONK.ZENITH_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS_MONK.XUENS_BOND_TALENT) ? 90 : 120,
        gcd: {
          base: 1000,
          minimum: 750,
        },
        enabled:
          combatant.hasTalent(TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT) &&
          combatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 35 - communionWithWindReduction - windwalkerTierCooldownReduction,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.STRIKE_OF_THE_WINDLORD_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.CELESTIAL_CONDUIT_WINDWALKER_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      // Utility
      {
        spell: TALENTS_MONK.RING_OF_PEACE_TALENT.id,
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
        spell: TALENTS_MONK.PARALYSIS_TALENT.id,
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
        cooldown: combatant.hasTalent(TALENTS_MONK.CELERITY_TALENT) ? 15 : 20,
        gcd: null,
        charges: combatant.hasTalent(TALENTS_MONK.CELERITY_TALENT) ? 3 : 2,
        enabled: !combatant.hasTalent(TALENTS_MONK.CHI_TORPEDO_TALENT),
      },
      {
        spell: TALENTS_MONK.CHI_TORPEDO_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: null,
        charges: 2,
        enabled: combatant.hasTalent(TALENTS_MONK.CHI_TORPEDO_TALENT),
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
        spell: TALENTS_MONK.TIGERS_LUST_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(TALENTS_MONK.TIGERS_LUST_TALENT),
      },
      {
        spell: TALENTS_MONK.TRANSCENDENCE_TALENT.id,
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
        spell: TALENTS_MONK.SPEAR_HAND_STRIKE_TALENT.id,
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
      // Defensives
      {
        spell: SPELLS.FORTIFYING_BREW_CAST.id,
        buffSpellId: SPELLS.FORTIFYING_BREW_BUFF.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120 - 30 * combatant.getTalentRank(TALENTS_MONK.EXPEDITIOUS_FORTIFICATION_TALENT),
        enabled: combatant.hasTalent(TALENTS_MONK.FORTIFYING_BREW_TALENT),
        gcd: null,
      },
      {
        spell: TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id,
        buffSpellId: TALENTS_MONK.DIFFUSE_MAGIC_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
        gcd: null,
        enabled: combatant.hasTalent(TALENTS_MONK.DIFFUSE_MAGIC_TALENT),
      },
    ];
  }
}

export default Abilities;
