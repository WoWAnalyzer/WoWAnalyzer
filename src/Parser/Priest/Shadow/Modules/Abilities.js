import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.VOID_BOLT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 4.5 / (1 + haste),
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          maxCasts: (cooldown, fightDuration, getAbility, parser) => {
            return calculateMaxCasts(cooldown, parser.modules.combatants.selected.getBuffUptime(SPELLS.VOIDFORM_BUFF.id));
          },
        },
      },
      {
        spell: SPELLS.MIND_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste, combatant) => (7.5 - (combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ? 1.5 : 0)) / (1 + haste),
        isOnGCD: true,
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
        isOnGCD: true,
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
        isOnGCD: true,
      },
      {
        spell: SPELLS.MIND_SEAR,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SHADOW_WORD_DEATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 9,
        isOnGCD: true,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.SHADOW_WORD_DEATH_TALENT.id),
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.VAMPIRIC_TOUCH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.VOID_ERUPTION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },

      // Cooldowns
      {
        spell: SPELLS.VOID_TORRENT_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        isOnGCD: true,
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
        isOnGCD: true,
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
        isOnGCD: true,
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
        isOnGCD: true,
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
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SURRENDER_TO_MADNESS_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 240,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.SURRENDER_TO_MADNESS_TALENT.id),
      },
      {
        spell: SPELLS.DARK_ASCENSION_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        isOnGCD: true,
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
        isOnGCD: true,
      },
      {
        spell: SPELLS.SILENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45 - (combatant.hasTalent(SPELLS.LAST_WORD_TALENT.id) ? 15 : 0),
        isOnGCD: false,
      },
      {
        spell: SPELLS.VAMPIRIC_EMBRACE,
        buffSpellId: SPELLS.VAMPIRIC_EMBRACE.id,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120 - (combatant.hasTalent(SPELLS.SANLAYN_TALENT.id) ? 45 : 0),
        isOnGCD: true,
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: haste => 6 / (1 + haste),
        isOnGCD: true,
      },
      {
        spell: SPELLS.SHADOW_MEND,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LEAP_OF_FAITH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
      },
      {
        spell: SPELLS.FADE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: false,
      },
      {
        spell: SPELLS.POWER_WORD_FORTITUDE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LEVITATE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        isOnGCD: false,
        isUndetectable: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.MASS_DISPEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        isOnGCD: true,
      },
      {
        spell: SPELLS.DISPEL_MAGIC,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.MIND_CONTROL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SHACKLE_UNDEAD,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.MIND_BOMB_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.PSYCHIC_HORROR_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.PSYCHIC_HORROR_TALENT.id),
      },
      {
        spell: SPELLS.MIND_VISION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PURIFY_DISEASE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SHADOWFORM,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.RESURRECTION,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;
