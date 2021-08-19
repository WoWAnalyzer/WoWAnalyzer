import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.VOID_BOLT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste: number) => 4.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          maxCasts: (cooldown: number) =>
            calculateMaxCasts(cooldown, combatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id)),
        },
        damageSpellIds: [SPELLS.VOID_BOLT.id, SPELLS.VOID_BOLT_DISSONANT_ECHOES.id],
      },
      {
        spell: SPELLS.MIND_BLAST.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste: number) => 7.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        charges: combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ? 2 : 1,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.MIND_FLAY.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_SEAR.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SEARING_NIGHTMARE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SEARING_NIGHTMARE_TALENT.id),
      },
      {
        spell: SPELLS.SHADOW_CRASH_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste: number) => 30 / (1 + haste),
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
        spell: SPELLS.SHADOW_WORD_PAIN.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEVOURING_PLAGUE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.VAMPIRIC_TOUCH.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DAMNATION_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.DAMNATION_TALENT.id),
      },

      // Cooldowns
      {
        spell: SPELLS.VOID_ERUPTION.id,
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
        spell: SPELLS.VOID_TORRENT_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
        },
        enabled: combatant.hasTalent(SPELLS.VOID_TORRENT_TALENT.id),
        damageSpellIds: [SPELLS.VOID_TORRENT_TALENT.id],
      },
      {
        spell: SPELLS.MINDBENDER_TALENT_SHADOW.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: [
          SPELLS.SHADOWFIEND.id,
          SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id,
          SPELLS.VOIDLING.id,
        ],
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
        spell: SPELLS.POWER_INFUSION.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },

      {
        spell: SPELLS.SURRENDER_TO_MADNESS_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SURRENDER_TO_MADNESS_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },

      // Utility
      {
        spell: SPELLS.DISPERSION.id,
        isDefensive: true,
        buffSpellId: SPELLS.DISPERSION.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120 - (combatant.hasTalent(SPELLS.INTANGIBILITY_TALENT.id) ? 30 : 0),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SILENCE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45 - (combatant.hasTalent(SPELLS.LAST_WORD_TALENT.id) ? 15 : 0),
        gcd: null,
      },
      {
        spell: SPELLS.VAMPIRIC_EMBRACE.id,
        buffSpellId: SPELLS.VAMPIRIC_EMBRACE.id,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120 - (combatant.hasTalent(SPELLS.SANLAYN_TALENT.id) ? 45 : 0),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD.id,
        isDefensive: true,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: (haste: any) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHADOW_MEND.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DESPERATE_PRAYER.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        gcd: null,
      },
      {
        spell: SPELLS.LEAP_OF_FAITH.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        gcd: null,
      },
      {
        spell: SPELLS.FADE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.POWER_WORD_FORTITUDE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LEVITATE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_SOOTHE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MASS_DISPEL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DISPEL_MAGIC.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIND_CONTROL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHACKLE_UNDEAD.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PSYCHIC_SCREAM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.MIND_BOMB_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.PSYCHIC_HORROR_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.PSYCHIC_HORROR_TALENT.id),
      },
      {
        spell: SPELLS.MIND_VISION.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PURIFY_DISEASE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHADOWFORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RESURRECTION.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLESHCRAFT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
    ];
  }
}

export default Abilities;
