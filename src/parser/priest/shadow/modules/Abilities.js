import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreAbilities from 'parser/core/modules/Abilities';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.VOID_BOLT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          maxCasts: cooldown => calculateMaxCasts(cooldown, combatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id)),
        },
      },
      {
        spell: SPELLS.MIND_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => (7.5 - (combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ? 1.5 : 0)) / (1 + haste),
        gcd: {
          base: 1500,
        },
        charges: 1 + (combatant.hasWaist(ITEMS.MANGAZAS_MADNESS.id) ? 1 : 0),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.55,
        },
        enabled: !combatant.hasTalent(SPELLS.SHADOW_WORD_VOID_TALENT.id),
      },
      {
        spell: SPELLS.SHADOW_WORD_VOID_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => (9 - (combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ? 1.5 : 0)) / (1 + haste),
        gcd: {
          base: 1500,
        },
        charges: 2 + (combatant.hasWaist(ITEMS.MANGAZAS_MADNESS.id) ? 1 : 0),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        enabled: combatant.hasTalent(SPELLS.SHADOW_WORD_VOID_TALENT.id),
      },
      {
        spell: SPELLS.MIND_FLAY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_SEAR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHADOW_WORD_DEATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 9,
        charges: 2,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SHADOW_WORD_DEATH_TALENT.id),
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.VAMPIRIC_TOUCH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.VOID_ERUPTION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      // Cooldowns
      {
        spell: SPELLS.VOID_TORRENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
        },
        enabled: combatant.hasTalent(SPELLS.VOID_TORRENT_TALENT.id),
      },
      {
        spell: SPELLS.DARK_VOID_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.4, // TODO: Determine at what cast efficiency this starts being worth the talent slot
        },
        enabled: combatant.hasTalent(SPELLS.DARK_VOID_TALENT.id),
      },
      {
        spell: SPELLS.MINDBENDER_TALENT_SHADOW,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: [SPELLS.SHADOWFIEND, SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA],
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SHADOW_CRASH_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        enabled: combatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id),
      },
      {
        spell: SPELLS.SURRENDER_TO_MADNESS_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 3 * 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SURRENDER_TO_MADNESS_TALENT.id),
      },
      {
        spell: SPELLS.DARK_ASCENSION_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
        enabled: combatant.hasTalent(SPELLS.DARK_ASCENSION_TALENT.id),
      },

      // Utility
      {
        spell: SPELLS.DISPERSION,
        isDefensive: true,
        buffSpellId: SPELLS.DISPERSION.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SILENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45 - (combatant.hasTalent(SPELLS.LAST_WORD_TALENT.id) ? 15 : 0),
        gcd: null,
      },
      {
        spell: SPELLS.VAMPIRIC_EMBRACE,
        buffSpellId: SPELLS.VAMPIRIC_EMBRACE.id,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120 - (combatant.hasTalent(SPELLS.SANLAYN_TALENT.id) ? 45 : 0),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: haste => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHADOW_MEND,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LEAP_OF_FAITH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        gcd: null,
      },
      {
        spell: SPELLS.FADE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.POWER_WORD_FORTITUDE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LEVITATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MASS_DISPEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISPEL_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_CONTROL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHACKLE_UNDEAD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.MIND_BOMB_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.PSYCHIC_HORROR_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.PSYCHIC_HORROR_TALENT.id),
      },
      {
        spell: SPELLS.MIND_VISION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PURIFY_DISEASE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHADOWFORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RESURRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
